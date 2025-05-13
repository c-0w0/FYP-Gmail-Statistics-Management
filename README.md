This project offers interactible elements that shows Gmail statistics over a selected period of time, in which all of them are hyperlink embedded, allowing quick access to the respective email you've just interacted in this application. 

# Screenshots

### First page: Statistics
![image](https://github.com/user-attachments/assets/e772fbb4-d46a-4e95-9e5f-73ac313a5053)
![image](https://github.com/user-attachments/assets/27462982-a36f-41b6-b32a-d15d29584151)

### Second page: Management
- If an email account was taken action of `Mark as Spam`, specific emails will be asked for it will to moved into `Spam` and reported as spam.
- If an email account was taken action of `Block`, system will double-check with the user before tagging all the existed & incoming emails from the account as `Block`. _Check 'Known Limitations' below_
- If an email is associated with `Unsubscribe` hyperlink, it redirects the user to the content provider's website for further action upon clicked.
![image](https://github.com/user-attachments/assets/6bceb703-b367-43d5-aca7-e881a19270aa)

## Upon clicking
These are the brief display of the system, they are also hyperlink embedded, and showing Read/Unread based on font thickness.
### First page: Statistics
![image](https://github.com/user-attachments/assets/973144d0-f67d-472d-ae2d-5b5d3cf02942)
![image](https://github.com/user-attachments/assets/7460c325-102e-4f92-9194-6c1cb0b5d5a7)
![image](https://github.com/user-attachments/assets/703cf77d-f875-4c98-9c9b-be890c45f240)

### Second page: Management
![image](https://github.com/user-attachments/assets/b98267f8-2e63-4e48-a889-1ea37ce02f91)
![image](https://github.com/user-attachments/assets/7e62a803-695e-4e6c-b46c-8840f6262fdc)

The rest of the interactibles will bring you to Gmail directly, which is not provided screenshot.


# Prerequisites

- `php` version >= 8.2
- `Nodejs`
- Set up your own Google Cloud project, follow the steps below:
  - Create a new project at [Google Developer Console](https://console.cloud.google.com/cloud-resource-manager).
  - Press 'Get started' button and fill in information at [Overview](https://console.cloud.google.com/auth/overview).
    - At the top left, if the recent project isn't selected automatically, select it (Ctrl+O).
    ![image](https://github.com/user-attachments/assets/c60a5a90-ef6e-4f89-8883-2a62b1bd38b8)

  - Add test users at [Audience](https://console.cloud.google.com/auth/audience), fill in emails to be be granted access for the project created.
  - Create `OAuth 2.0 Client ID` at [Clients](https://console.cloud.google.com/auth/clients).
    - After it, click on the recently created `OAuth 2.0 Client ID`.
    - Over the right side, `Client ID` and `Client secret` are needed later.


# Usage

You may git clone or download this project.
```
git clone https://github.com/c-0w0/FYP-Gmail-Statistics-Management.git
```

**Before executing** the application, update `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` with `Client ID` and `Client secret` respectively in `.env` file .

![image](https://github.com/user-attachments/assets/8262853d-ac58-4a4d-8f61-fc6056de7e0a)

To run this project, type the following commands in VSC terminal:

```
php artisan serve
```

```
npm run dev
```

```
npm run watch
```
Then, visit `http://127.0.0.1:8000/`


# Known Limitations

1. This project's hyperlink only works for the first Gmail logged in.
2. This project uses time zone of (GMT+8), and does not react to your location.
3. The block function in `Management` page isn't the actual block function, but a filter that will be applied to move every existed & incoming emails from the email account which has been taken action.
