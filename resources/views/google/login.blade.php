<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/css/bootstrap.min.css">
    <style>
        body, html {
            height: 100%;
            margin: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            background-color: #f8f9fa;
        }
        .login-button {
            font-size: 1.5rem;
        }
        .google-login-button {
            display: inline-flex;
            align-items: center;
            background-color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 5px;
            text-decoration: none; /* Remove underline */
            color: black; /* Text color */
            cursor: pointer; /* Change cursor to pointer */
        }

        .google-login-button .google-logo {
            margin-right: 8px; /* Space between image and text */
        }

        .login-text {
            font-weight: 600; /* Thicker than normal */
            font-size: 18px;
        }
    </style>
</head>
<body>
    <div style="text-align: center;">
        <h4 style="margin: 0;">Login to myFYP</h4>
        <button class="google-login-button" 
                onclick="window.location.href='/auth/google';" 
                style="border: 2px solid lightgray; background: white; cursor: pointer; padding: 10px; border-radius: 4px; width: 600px; display: flex; justify-content: center; align-items: center; margin-top: 10px;">
            <img src="data:image/svg+xml,%3csvg%20width='17'%20height='16'%20viewBox='0%200%2017%2016'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cg%20clip-path='url(%23clip0_159_382)'%3e%3cpath%20d='M16.3439%208.18429C16.3439%207.64047%2016.2998%207.09371%2016.2058%206.55872H8.65991V9.63937H12.9811C12.8018%2010.6329%2012.2256%2011.5119%2011.3819%2012.0704V14.0693H13.9599C15.4738%2012.6759%2016.3439%2010.6182%2016.3439%208.18429Z'%20fill='%234285F4'/%3e%3cpath%20d='M8.65999%2016.0005C10.8176%2016.0005%2012.6372%2015.2921%2013.9629%2014.0692L11.385%2012.0703C10.6677%2012.5583%209.74174%2012.8346%208.66293%2012.8346C6.57584%2012.8346%204.80623%2011.4266%204.17128%209.53351H1.51099V11.5941C2.86906%2014.2956%205.63518%2016.0005%208.65999%2016.0005Z'%20fill='%2334A853'/%3e%3cpath%20d='M4.16827%209.53349C3.83316%208.53993%203.83316%207.46405%204.16827%206.47048V4.40985H1.51091C0.376245%206.67037%200.376245%209.3336%201.51091%2011.5941L4.16827%209.53349Z'%20fill='%23FBBC04'/%3e%3cpath%20d='M8.65999%203.16644C9.80053%203.1488%2010.9029%203.57798%2011.7289%204.36578L14.0129%202.08174C12.5667%200.72367%2010.6471%20-0.0229773%208.65999%200.000539111C5.63518%200.000539111%202.86906%201.70548%201.51099%204.40987L4.16834%206.4705C4.80035%204.57449%206.5729%203.16644%208.65999%203.16644Z'%20fill='%23EA4335'/%3e%3c/g%3e%3cdefs%3e%3cclipPath%20id='clip0_159_382'%3e%3crect%20width='16'%20height='16'%20fill='white'%20transform='translate(0.5)'/%3e%3c/clipPath%3e%3c/defs%3e%3c/svg%3e" alt="Google Logo" class="google-logo" style="margin-right: 8px;" />
            <span class="login-text">Login with Google</span>
        </button>
    </div>
</body>







</html>
