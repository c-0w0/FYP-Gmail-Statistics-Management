<?php

namespace App\Services;

use Google\Client;
use Google\Service\Gmail;
use Google\Service\Gmail\ModifyMessageRequest;
use Google\Service\Gmail\Filter;
use Google\Service\Gmail\Label;
use GuzzleHttp\Client as GuzzleClient;
use GuzzleHttp\Promise\Utils;
use GuzzleHttp\Promise\PromiseInterface;
use GuzzleHttp\Exception\RequestException;

use DOMDocument;
use DOMXPath;

class GoogleService
{
    protected $client;
    protected $guzzleClient;

    public function __construct()
    {
        $this->client = new Client();
        $this->client->setClientId(env('GOOGLE_CLIENT_ID'));
        $this->client->setClientSecret(env('GOOGLE_CLIENT_SECRET'));
        $this->client->setRedirectUri(env('GOOGLE_REDIRECT_URI'));
        $this->client->addScope(Gmail::GMAIL_MODIFY);
        $this->client->setAccessType('offline');
        $this->client->addScope(Gmail::GMAIL_SETTINGS_BASIC);

        $this->guzzleClient = new GuzzleClient([
            'verify' => env('APP_ENV') !== 'local', // Only disable in the local environment
        ]);
        $this->client->setHttpClient($this->guzzleClient);
    }

// Communication ====================================================================================================================

    public function getAuthUrl()
    {
        return $this->client->createAuthUrl();
    }
    
    public function authenticate($code)
    {
        return $this->client->fetchAccessTokenWithAuthCode($code);
    }
    
    public function setAccessToken($token)
    {
        $this->client->setAccessToken($token);
    }
    
// General hook on ====================================================================================================================
    
    public function fetchMessages($folder, $startDate) 
    {
        $accessToken = $this->client->getAccessToken()['access_token'];
        $baseUrl = "https://www.googleapis.com/gmail/v1/users/me/messages";
        $url = "{$baseUrl}?q=after:" . strtotime($startDate) . " in:{$folder}";

        $batchSize = 100;
        $messages = [];
        $pageToken = null;

        do {
            $response = $this->guzzleClient->get($url . ($pageToken ? '&pageToken=' . $pageToken : ''), [
                'headers' => [
                    'Authorization' => "Bearer {$accessToken}",
                ]
            ]);

            $data = json_decode($response->getBody()->getContents(), true);
            $messages = array_merge($messages, $data['messages'] ?? []);
            $pageToken = $data['nextPageToken'] ?? null;
        } while ($pageToken);

        $batchRequests = [];
        foreach (array_chunk($messages, $batchSize) as $messageBatch) {
            foreach ($messageBatch as $message) {
                $messageId = $message['id'];
                $batchRequests[] = $this->guzzleClient->getAsync("{$baseUrl}/{$messageId}?format=full", [
                    'headers' => [
                        'Authorization' => "Bearer {$accessToken}",
                    ]
                ]);
            }
        }

        $results = Utils::settle($batchRequests)->wait();
        $emailData = [];

        foreach ($results as $result) {
            if ($result['state'] === 'fulfilled') {
                $details = json_decode($result['value']->getBody()->getContents(), true);
                $headers = $details['payload']['headers'] ?? [];
                $snippet = $details['snippet'] ?? 'No Title';
                $time = isset($details['internalDate']) ? (new \DateTime('@' . $details['internalDate'] / 1000))->modify('+8 hours')->format('Y-m-d H:i:s') : 'No Date';

                $messageId = $details['id'] ?? '';
                $labelIds = $details['labelIds'] ?? [];

                $isUnread = ($folder === "sent") ? false : !in_array('INBOX', $labelIds) || in_array('UNREAD', $labelIds);

                $name = '';
                $account = '';

                foreach ($headers as $header) {
                    if ($folder === 'sent' && $header['name'] === 'To') {
                        preg_match('/(.*)<(.+)>/', $header['value'], $matches);
                        $name = isset($matches[1]) ? trim($matches[1]) : '';
                        $account = isset($matches[2]) ? trim($matches[2]) : trim($header['value']);
                        break;
                    } elseif ($folder !== 'sent' && $header['name'] === 'From') {
                        preg_match('/(.*)<(.+)>/', $header['value'], $matches);
                        $name = isset($matches[1]) ? trim($matches[1]) : '';
                        $account = isset($matches[2]) ? trim($matches[2]) : trim($header['value']);
                        break;
                    }
                }

                $emailData[] = [
                    'name' => $name,
                    'account' => $account,
                    'title' => $snippet,
                    'time' => $time,
                    'messageId' => $messageId, 
                    'isUnread' => $isUnread,
                ];
            }
        }

        return $emailData;
    }
            
    public function fetchUniqueEmailData($folder, $startDate, $headerName) 
    {
        $accessToken = $this->client->getAccessToken()['access_token'];
        $baseUrl = "https://www.googleapis.com/gmail/v1/users/me/messages";
        $url = "{$baseUrl}?q=after:" . strtotime($startDate) . " in:{$folder}";
    
        $batchSize = 100;
        $messages = [];
        $pageToken = null;
    
        // Fetch messages in batches
        do {
            $response = $this->guzzleClient->get($url . ($pageToken ? '&pageToken=' . $pageToken : ''), [
                'headers' => [
                    'Authorization' => "Bearer {$accessToken}",
                ]
            ]);
    
            $data = json_decode($response->getBody()->getContents(), true);
            $messages = array_merge($messages, $data['messages'] ?? []);
            $pageToken = $data['nextPageToken'] ?? null;
        } while ($pageToken);
    
        $batchRequests = [];
        foreach (array_chunk($messages, $batchSize) as $messageBatch) {
            foreach ($messageBatch as $message) {
                $messageId = $message['id'];
                $batchRequests[] = $this->guzzleClient->getAsync("{$baseUrl}/{$messageId}?format=full", [
                    'headers' => [
                        'Authorization' => "Bearer {$accessToken}",
                    ]
                ]);
            }
        }
    
        $results = Utils::settle($batchRequests)->wait();
    
        $emailData = [];
        foreach ($results as $result) {
            if ($result['state'] === 'fulfilled') {
                $details = json_decode($result['value']->getBody()->getContents(), true);
                $headers = $details['payload']['headers'] ?? [];
    
                // Convert internalDate to a readable date format and ensure comparison is correct
                $emailTimestamp = $details['internalDate'] / 1000; // internalDate is in milliseconds
                $time = isset($details['internalDate']) ? (new \DateTime('@' . $details['internalDate'] / 1000))->modify('+8 hours')->format('Y-m-d H:i:s') : 'No Date';

    
                // Compare email date with the start date
                if ($emailTimestamp < strtotime($startDate)) {
                    continue; // Skip emails that don't meet the timeframe
                }
    
                // Initialize the unsubscribe URL as null
                $unsubscribeUrl = null;
    
                // Extract the body of the email for further processing
                $body = '';
                if (isset($details['payload']['parts'])) {
                    foreach ($details['payload']['parts'] as $part) {
                        if (isset($part['mimeType']) && $part['mimeType'] === 'text/html') {
                            $body = $part['body']['data'] ?? '';
                            break;
                        }
                    }
                } else {
                    // Handle the case where there are no parts (e.g., simple text email)
                    $body = $details['payload']['body']['data'] ?? '';
                }
    
                if ($body) {
                    // Base64 decode if needed
                    $body = base64_decode(str_replace(['-', '_'], ['+', '/'], $body));
    
                    // Parse the email body to find unsubscribe links
                    $dom = new DOMDocument();
                    @$dom->loadHTML($body); // Suppress warnings if the HTML is malformed
                    $xpath = new DOMXPath($dom);
                    $query = "//a[contains(translate(., 'UNSUBSCRIBE', 'unsubscribe'),'unsubscribe')]";
                    $anchors = $xpath->query($query);
    
                    if ($anchors->length > 0) {
                        $unsubscribeUrl = $anchors->item(0)->getAttribute('href');
                    }
                }
    
                foreach ($headers as $header) {
                    if ($header['name'] === $headerName) {
                        $values = explode(',', $header['value']);
                        foreach ($values as $value) {
                            // Extract the name and email address
                            preg_match('/(.*)<(.+)>/', $value, $matches);
                            $name = isset($matches[1]) ? trim($matches[1]) : '';
                            $account = isset($matches[2]) ? trim($matches[2]) : trim($value);
    
                            // Aggregate data by account
                            $key = strtolower($account);
                            if (!isset($emailData[$key])) {
                                $emailData[$key] = [
                                    'name' => $name,
                                    'account' => $account,
                                    'frequency' => 0,
                                    'latest_contact_time' => $time,
                                    'messageId' => $details['id'],
                                    'unsubscribeUrl' => $unsubscribeUrl,
                                ];
                            }
    
                            // Update frequency and latest contact time
                            $emailData[$key]['frequency'] += 1;
                            if ($time > $emailData[$key]['latest_contact_time']) {
                                $emailData[$key]['latest_contact_time'] = $time;
                            }
                        }
                    }
                }
            }
        }
    
        // Return the aggregated email data as a non-associative array
        return array_values($emailData);
    }
        
// Statistics - 4 Basics (UI) ====================================================================================================================

    public function getSentMessages($startDate) #A
    {
        return $this->fetchMessages('sent', $startDate);
    }

    public function getReceivedMessages($startDate) #B
    {
        return $this->fetchMessages('inbox', $startDate);
    }

    public function getRecipients($startDate) #C
    {
        return $this->fetchUniqueEmailData('sent', $startDate, 'To');
    }

    public function getSenders($startDate) #D
    {
        return $this->fetchUniqueEmailData('inbox', $startDate, 'From');
    }
        
// Statistics - PieChart ====================================================================================================================

    public function fetchReadStatusData($folder, $startDate)
    {
        $accessToken = $this->client->getAccessToken()['access_token'];
        $baseUrl = "https://www.googleapis.com/gmail/v1/users/me/messages";
        $url = "{$baseUrl}?q=after:" . strtotime($startDate) . " in:{$folder}";

        $batchSize = 100;
        $messages = [];
        $pageToken = null;

        // Fetch messages in batches
        do {
            $response = $this->guzzleClient->get($url . ($pageToken ? '&pageToken=' . $pageToken : ''), [
                'headers' => [
                    'Authorization' => "Bearer {$accessToken}",
                ]
            ]);

            $data = json_decode($response->getBody()->getContents(), true);
            $messages = array_merge($messages, $data['messages'] ?? []);
            $pageToken = $data['nextPageToken'] ?? null;
        } while ($pageToken);

        $batchRequests = [];
        foreach (array_chunk($messages, $batchSize) as $messageBatch) {
            foreach ($messageBatch as $message) {
                $messageId = $message['id'];
                $batchRequests[] = $this->guzzleClient->getAsync("{$baseUrl}/{$messageId}?format=metadata", [
                    'headers' => [
                        'Authorization' => "Bearer {$accessToken}",
                    ]
                ]);
            }
        }

        $results = Utils::settle($batchRequests)->wait();

        $readStatusData = [
            'read' => 0,
            'unread' => 0,
        ];

        foreach ($results as $result) {
            if ($result['state'] === 'fulfilled') {
                $details = json_decode($result['value']->getBody()->getContents(), true);
                $labelIds = $details['labelIds'] ?? [];

                // Determine read/unread status based on label presence
                $isUnread = !in_array('INBOX', $labelIds) || in_array('UNREAD', $labelIds);
                $isUnread ? $readStatusData['unread']++ : $readStatusData['read']++;
            }
        }

        return $readStatusData;
    }

    public function fetchEmailsBySender($account, $startDate) 
    {
        $accessToken = $this->client->getAccessToken()['access_token'];
        $baseUrl = "https://www.googleapis.com/gmail/v1/users/me/messages";
        
        $url = "{$baseUrl}?q=from:{$account} after:" . strtotime($startDate);
        
        $batchSize = 100;
        $messages = [];
        $pageToken = null;
    
        do {
            $response = $this->guzzleClient->get($url . ($pageToken ? '&pageToken=' . $pageToken : ''), [
                'headers' => [
                    'Authorization' => "Bearer {$accessToken}",
                ]
            ]);
    
            $data = json_decode($response->getBody()->getContents(), true);
            $messages = array_merge($messages, $data['messages'] ?? []);
            $pageToken = $data['nextPageToken'] ?? null;
        } while ($pageToken);
    
        $batchRequests = [];
        foreach (array_chunk($messages, $batchSize) as $messageBatch) {
            foreach ($messageBatch as $message) {
                $messageId = $message['id'];
                $batchRequests[] = $this->guzzleClient->getAsync("{$baseUrl}/{$messageId}?format=full", [
                    'headers' => [
                        'Authorization' => "Bearer {$accessToken}",
                    ]
                ]);
            }
        }
    
        $results = Utils::settle($batchRequests)->wait();
        $emailData = [];
    
        foreach ($results as $result) {
            if ($result['state'] === 'fulfilled') {
                $details = json_decode($result['value']->getBody()->getContents(), true);
                $headers = $details['payload']['headers'] ?? [];
                $snippet = $details['snippet'] ?? 'No Title';
                $time = isset($details['internalDate']) ? (new \DateTime('@' . $details['internalDate'] / 1000))->modify('+8 hours')->format('Y-m-d H:i:s') : 'No Date';
    
                $messageId = $details['id'] ?? '';
                $isUnread = in_array('UNREAD', $details['labelIds'] ?? []);
    
                $emailData[] = [
                    'title' => $snippet,
                    'time' => $time,
                    'messageId' => $messageId, 
                    'isUnread' => $isUnread,
                ];
            }
        }
    
        return $emailData;
    }

    // ===============================
    public function modifyEmailLabels($messageId, $labelsToAdd = [], $labelsToRemove = [])
    {
        $service = new Gmail($this->client);

        $mods = new ModifyMessageRequest();
        $mods->setAddLabelIds($labelsToAdd);
        $mods->setRemoveLabelIds($labelsToRemove);

        return $service->users_messages->modify('me', $messageId, $mods);
    }

    public function blockSender($senderEmail, $labelName)
    {
        try {
            $service = new Gmail($this->client);
    
            // Ensure the label exists and get its ID
            $labelId = $this->createOrGetLabel($labelName);
    
            // Create a new filter to apply the "Blocked" label to emails from the sender
            $filter = new Filter([
                'criteria' => [
                    'from' => $senderEmail, // The sender to block
                ],
                'action' => [
                    'addLabelIds' => [$labelId], // Add the "Blocked" label to these emails
                    // 'removeLabelIds' => ['INBOX'], // Optional: Remove from INBOX
                ],
            ]);
    
            // Create the filter using the Gmail API
            $service->users_settings_filters->create('me', $filter);
    
            $this->applyLabelToExistingEmails($senderEmail, $labelId);
            return response()->json(['message' => 'Sender has been blocked and emails will be labeled as "Blocked".']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'An error occurred while blocking the sender: ' . $e->getMessage()], 500);
        }
    }
    
    private function createOrGetLabel($labelName)
    {
        try {
            $service = new Gmail($this->client);
            $labels = $service->users_labels->listUsersLabels('me');
    
            // Check if the label already exists
            foreach ($labels->getLabels() as $label) {
                if ($label->getName() === $labelName) {
                    return $label->getId(); // Return the existing label ID
                }
            }
    
            // Create a new label if it doesn't exist
            $label = new Label([
                'name' => $labelName,
                'labelListVisibility' => 'labelShow',
                'messageListVisibility' => 'show'
            ]);
    
            $createdLabel = $service->users_labels->create('me', $label);
            return $createdLabel->getId(); // Return the newly created label ID
        } catch (\Exception $e) {
            return response()->json(['error' => 'An error occurred while creating or retrieving the label: ' . $e->getMessage()], 500);
        }
    }
    
    private function applyLabelToExistingEmails($senderEmail, $labelId)
    {
        $accessToken = $this->client->getAccessToken()['access_token'];
        $baseUrl = "https://www.googleapis.com/gmail/v1/users/me/messages";
        $url = "{$baseUrl}?q=from:" . urlencode($senderEmail);
    
        $batchSize = 100;
        $messages = [];
        $pageToken = null;
    
        // Fetch message IDs in batches
        do {
            $response = $this->guzzleClient->get($url . ($pageToken ? '&pageToken=' . $pageToken : ''), [
                'headers' => [
                    'Authorization' => "Bearer {$accessToken}",
                ]
            ]);
    
            $data = json_decode($response->getBody()->getContents(), true);
            $messages = array_merge($messages, $data['messages'] ?? []);
            $pageToken = $data['nextPageToken'] ?? null;
        } while ($pageToken);
    
        if (empty($messages)) {
            return; // No emails found from the sender
        }
    
        // Create batch requests for modifying labels
        $batchRequests = [];
        foreach (array_chunk($messages, $batchSize) as $messageBatch) {
            foreach ($messageBatch as $message) {
                $messageId = $message['id'];
                $batchRequests[] = $this->guzzleClient->postAsync("{$baseUrl}/{$messageId}/modify", [
                    'headers' => [
                        'Authorization' => "Bearer {$accessToken}",
                        'Content-Type' => 'application/json',
                    ],
                    'json' => [
                        'addLabelIds' => [$labelId],
                        'removeLabelIds' => ['INBOX'] // Optional: Remove from INBOX
                    ]
                ]);
            }
        }
    
        // Execute batch requests
        $results = Utils::settle($batchRequests)->wait();
    
        foreach ($results as $result) {
            if ($result['state'] === 'fulfilled') {
                // Optionally handle successful modifications
            } else {
                // Optionally handle errors
                info('Error applying label to existing emails: ' . $result['reason']);
            }
        }
    }
}
