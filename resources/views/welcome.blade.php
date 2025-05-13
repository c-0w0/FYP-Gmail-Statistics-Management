<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
 
        <title>Laravel</title>

        @vite(['resources/sass/app.scss', 'resources/js/app.js'])

        <!-- Fonts -->
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&display=swap" rel="stylesheet">
        <link href="/css/app.css" rel="stylesheet">
        <!-- Styles -->
 
    </head>
    
    <body class="antialiased">
        <div id="example"></div>
    </body>

</html>
 