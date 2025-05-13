<?php

namespace App\Http\Controllers;

use App\Services\GoogleService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;
use GuzzleHttp\Promise;
use GuzzleHttp\Exception\RequestException;
use Log;

class GoogleController extends Controller
{
    protected $googleService;

    public function __construct(GoogleService $googleService)
    {
        $this->googleService = $googleService;
    }

// Communication ====================================================================================================================

    public function redirectToGoogle()
    {
        return redirect($this->googleService->getAuthUrl());
    }

    public function handleGoogleCallback(Request $request)
    {
        $token = $this->googleService->authenticate($request->input('code'));
        Session::put('google_token', $token);

        return redirect('/stats');
    }

// Statistics ====================================================================================================================

    public function requestAll(Request $request) #0
    {
        $this->googleService->setAccessToken(Session::get('google_token'));

        $timeframe = $request->get('timeframe', 7);

        $startDate = now()->subDays($timeframe)->format('Y-m-d\TH:i:s\Z');

        try {
            // Fetch the number of emails sent, received, unique recipients, and unique senders
            $sent = $this->googleService->getSentMessages($startDate);
            $received = $this->googleService->getReceivedMessages($startDate);
            $recipients = $this->googleService->getRecipients($startDate);
            $senders = $this->googleService->getSenders($startDate);

            return view('google.stats', compact('timeframe', 'sent', 'received', 'recipients', 'senders'));
        } catch (RequestException $e) {
            // Handle exceptions from Guzzle requests
            return response()->json(['error' => 'An error occurred while fetching data: ' . $e->getMessage()], 500);
        }
    }

// Statistics - Heatmap ====================================================================================================================

    public function getSentMessagesDetails($timeframe) {
        $this->googleService->setAccessToken(Session::get('google_token'));
        $startDate = now()->subDays($timeframe)->format('Y-m-d\TH:i:s\Z'); // RFC3339 format

        try {
            // Fetch messages from the Google service
            $receivedMessages = $this->googleService->getSentMessages($startDate);
            // info(json_encode($receivedMessages, JSON_PRETTY_PRINT));

            // Initialize an empty array to store processed data
            $messagesData = [];
            
            foreach ($receivedMessages as $message) {
                // Ensure the message contains the time field
                if (isset($message['time'])) {
                    try {
                        // Create a DateTime object from the message's time
                        $receivedAt = new \DateTime($message['time']); // Use the correct timestamp field

                        // Extract day of the week and time
                        $dayOfWeek = $receivedAt->format('l');  // e.g., Monday
                        $time = $receivedAt->format('H00');     // e.g., 14:30 ->1400

                        // Initialize the array for this day if it doesn't exist
                        if (!isset($messagesData[$dayOfWeek])) {
                            $messagesData[$dayOfWeek] = [];
                        }

                        // Initialize the array for this time if it doesn't exist
                        if (!isset($messagesData[$dayOfWeek][$time])) {
                            $messagesData[$dayOfWeek][$time] = [
                                'count' => 0,      // Initialize the count
                                'messages' => [],
                            ];
                        }
                        $messagesData[$dayOfWeek][$time]['count']++;
                        $messagesData[$dayOfWeek][$time]['messages'][] = [
                            'messageId' => $message['messageId'],
                            'isUnread' =>  $message['isUnread'],
                            'name' => $message['name'],
                            'account' => $message['account'],
                            'title' => $message['title'],
                            'time' => $message['time'],
                        ];

                    } catch (\Exception $e) {
                        // Log and skip any messages that have invalid timestamps
                        continue;
                    }
                } else {
                    // Log any message that doesn't have the expected time field
                }
            }

            // info(json_encode($messagesData, JSON_PRETTY_PRINT));
            
            // Return the processed data as a JSON response
            return response()->json($messagesData);
        } catch (RequestException $e) {
            // Return an error response if there's a problem fetching the messages
            return response()->json(['error' => 'An error occurred while fetching data: ' . $e->getMessage()], 500);
        }
    }

    public function getReceivedMessagesDetails($timeframe) {
        $this->googleService->setAccessToken(Session::get('google_token'));
        $startDate = now()->subDays($timeframe)->format('Y-m-d\TH:i:s\Z'); // RFC3339 format

        try {
            // Fetch messages from the Google service
            $receivedMessages = $this->googleService->getReceivedMessages($startDate);
            // info(json_encode($receivedMessages, JSON_PRETTY_PRINT));

            // Initialize an empty array to store processed data
            $messagesData = [];
            
            foreach ($receivedMessages as $message) {
                // Ensure the message contains the time field
                if (isset($message['time'])) {
                    try {
                        // Create a DateTime object from the message's time
                        $receivedAt = new \DateTime($message['time']); // Use the correct timestamp field

                        // Extract day of the week and time
                        $dayOfWeek = $receivedAt->format('l');  // e.g., Monday
                        $time = $receivedAt->format('H00');     // e.g., 14:30 ->1400

                        // Initialize the array for this day if it doesn't exist
                        if (!isset($messagesData[$dayOfWeek])) {
                            $messagesData[$dayOfWeek] = [];
                        }

                        // Initialize the array for this time if it doesn't exist
                        if (!isset($messagesData[$dayOfWeek][$time])) {
                            $messagesData[$dayOfWeek][$time] = [
                                'count' => 0,      // Initialize the count
                                'messages' => [],
                            ];
                        }
                        $messagesData[$dayOfWeek][$time]['count']++;
                        $messagesData[$dayOfWeek][$time]['messages'][] = [
                            'messageId' => $message['messageId'],
                            'isUnread' =>  $message['isUnread'],
                            'name' => $message['name'],
                            'account' => $message['account'],
                            'title' => $message['title'],
                            'time' => $message['time'],
                        ];
    
                    } catch (\Exception $e) {
                        // Log and skip any messages that have invalid timestamps
                        continue;
                    }
                } else {
                    // Log any message that doesn't have the expected time field
                }
            }

            // info(json_encode($messagesData, JSON_PRETTY_PRINT));
            return response()->json($messagesData);
        } catch (RequestException $e) {
            // Return an error response if there's a problem fetching the messages
            return response()->json(['error' => 'An error occurred while fetching data: ' . $e->getMessage()], 500);
        }
    }

// Statistics - AreaChart ====================================================================================================================

    public function getSentMessagesPerDay($timeframe) {
        $this->googleService->setAccessToken(Session::get('google_token'));

        // Calculate the start date based on the number of timeframe days
        $startDate = now()->subDays($timeframe)->format('Y-m-d');

        try {
            // Fetch sent messages from GoogleService
            $messages = $this->googleService->getSentMessages($startDate);
            // info(json_encode($messages, JSON_PRETTY_PRINT));

            // Initialize an array to store messages grouped by date
            $messagesPerDay = [];

            foreach ($messages as $message) {
                // Extract the date from the message time
                $date = date('Y-m-d', strtotime($message['time']));

                // Initialize the date entry if it doesn't exist
                if (!isset($messagesPerDay[$date])) {
                    $messagesPerDay[$date] = 0;
                }

                // Increment the count for the day
                $messagesPerDay[$date]++;
            }


            // info(json_encode($messagesPerDay, JSON_PRETTY_PRINT));
            return response()->json($messagesPerDay);        
            
        } catch (RequestException $e) {
            return response()->json(['error' => 'An error occurred while fetching data: ' . $e->getMessage()], 500);
        }
    }

    public function getReceivedMessagesPerDay($timeframe) {
        $this->googleService->setAccessToken(Session::get('google_token'));

        // Calculate the start date based on the number of timeframe days
        $startDate = now()->subDays($timeframe)->format('Y-m-d');

        try {
            // Fetch sent messages from GoogleService
            $messages = $this->googleService->getReceivedMessages($startDate);
            // info(json_encode($messages, JSON_PRETTY_PRINT)); 

            // Initialize an array to store messages grouped by date
            $messagesPerDay = [];

            foreach ($messages as $message) {
                // Extract the date from the message time
                $date = date('Y-m-d', strtotime($message['time']));

                // Initialize the date entry if it doesn't exist
                if (!isset($messagesPerDay[$date])) {
                    $messagesPerDay[$date] = 0;
                }

                // Increment the count for the day
                $messagesPerDay[$date]++;
            }

            // info(json_encode($messagesPerDay, JSON_PRETTY_PRINT));
            return response()->json($messagesPerDay);        
            
        } catch (RequestException $e) {
            return response()->json(['error' => 'An error occurred while fetching data: ' . $e->getMessage()], 500);
        }
    }

// Statistics - PieChart ====================================================================================================================

    public function getRecipientsData($timeframe) {
        $this->googleService->setAccessToken(Session::get('google_token'));
        $startDate = now()->subDays($timeframe)->format('Y-m-d\TH:i:s\Z');

        try {
            $recipients = $this->googleService->getRecipients($startDate);
            // info(json_encode($senders, JSON_PRETTY_PRINT));
            return response()->json($recipients);
        } catch (RequestException $e) {
            return response()->json(['error' => 'An error occurred while fetching data: ' . $e->getMessage()], 500);
        }
    }

    public function getSendersData($timeframe) {
        $this->googleService->setAccessToken(Session::get('google_token'));
        $startDate = now()->subDays($timeframe)->format('Y-m-d\TH:i:s\Z');

        try {
            $senders = $this->googleService->getSenders($startDate);
            // info(json_encode($senders, JSON_PRETTY_PRINT));
            return response()->json($senders);
        } catch (RequestException $e) {
            return response()->json(['error' => 'An error occurred while fetching data: ' . $e->getMessage()], 500);
        }
    }

    public function getReadStatusData($timeframe)
    {
        $this->googleService->setAccessToken(Session::get('google_token'));
        $startDate = now()->subDays($timeframe)->format('Y-m-d\TH:i:s\Z');

        try {
            $data = $this->googleService->fetchReadStatusData('inbox', $startDate);
            // info(json_encode($data, JSON_PRETTY_PRINT));
            return response()->json($data);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to fetch read status data: ' . $e->getMessage()], 500);
        }
    }

// Management ====================================================================================================================

    public function listEmail(Request $request) #1
    {
        $this->googleService->setAccessToken(Session::get('google_token'));
        $timeframe = $request->get('timeframe', 7);
        $startDate = now()->subDays($timeframe)->format('Y-m-d\TH:i:s\Z');

        try {
            $senders = $this->googleService->getSenders($startDate);
            // info(json_encode($senders, JSON_PRETTY_PRINT));
            return view('google.management', compact('timeframe', 'senders'));
        } catch (RequestException $e) {
            return response()->json(['error' => 'An error occurred while fetching data: ' . $e->getMessage()], 500);
        }
    }

    public function fetchEmailsBySender($account, $timeframe)
    {
        $this->googleService->setAccessToken(Session::get('google_token'));
        $startDate = now()->subDays($timeframe)->format('Y-m-d\TH:i:s\Z');
        
        try {
            $emails = $this->googleService->fetchEmailsBySender($account, $startDate);
            // info(json_encode($emails, JSON_PRETTY_PRINT));
            return response()->json($emails);
        } catch (RequestException $e) {
            return response()->json(['error' => 'An error occurred while fetching data: ' . $e->getMessage()], 500);
        }
    }

    public function markAsSpam($messageId)
    {
        $this->googleService->setAccessToken(Session::get('google_token'));
        
        try {
            $this->googleService->modifyEmailLabels($messageId, ['SPAM'], []); // Add 'SPAM' label, remove no labels
            
            return response()->json(['success' => true, 'message' => 'Email has been marked as spam.']);
        } catch (RequestException $e) {
            return response()->json(['error' => 'An error occurred while marking the email as spam: ' . $e->getMessage()], 500);
        }
    }

    public function blockEmail($senderEmail, $labelName)
    {
        $this->googleService->setAccessToken(Session::get('google_token'));
        try {
            $this->googleService->blockSender($senderEmail, $labelName);
            
            return response()->json(['success' => true, 'message' => 'Email has been blocked. Emails moved to label "Blocked".']);
        } catch (RequestException $e) {
            return response()->json(['error' => 'An error occurred while trying to block the email: ' . $e->getMessage()], 500);
        }
    }
}
