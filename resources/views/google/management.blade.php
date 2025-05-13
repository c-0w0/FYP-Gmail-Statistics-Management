<!DOCTYPE html>
<html lang="en">
<head>
    <title>Management</title>
    @vite(['resources/sass/app.scss', 'resources/js/app.js'])
    <style>
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 8px; border: 1px solid #ddd; }
        thead { background-color: #f2f2f2; text-align: left; border-bottom: 2px solid #ddd; }
        tbody tr:nth-child(even) { background-color: #f2f2f2; }
        tbody tr:nth-child(odd) { background-color: #ffffff; }
        tbody tr:hover { background-color: #e9ecef; }
        a { text-decoration: none; color: #007bff; }
        a:hover { text-decoration: underline; }
        .sort-dropdown {
            display: inline-block;
            position: relative;
            margin-left: 10px;
        }
        .sort-dropdown select {
            padding: 8px 12px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 1rem;
        }
    </style>
</head>

<body style="background-color: #eeeeee;">
    @include('components.header')

    <div style="text-align: center; margin: 0 auto; width: 90%;">
        <form style='text-align: right' action="{{ url('/logout') }}" method="POST" style="margin-top: 20px;">
            @csrf
            <button type="submit" style="padding: 8px 12px; font-size: 1rem; border: 1px solid #ccc; border-radius: 4px; background-color: #f44336; color: white;">Logout</button>
        </form>
        
        <form action="{{ url('/management') }}" method="GET">
            <label for="timeframe" style="font-weight: bold; font-size: 1.5rem; margin-right: 10px;">Select Time Frame:</label>
            <select name="timeframe" id="timeframe" onchange="this.form.submit()" style="padding: 8px 12px; font-size: 1rem; border: 1px solid #ccc; border-radius: 4px; background-color: #f9f9f9;">
                <option value="7" {{ request('timeframe') == 7 ? 'selected' : '' }}>7 Days</option>
                <option value="14" {{ request('timeframe') == 14 ? 'selected' : '' }}>14 Days</option>
                <option value="30" {{ request('timeframe') == 30 ? 'selected' : '' }}>30 Days</option>
            </select>
        </form>
    </div>

    <script>
        window.managementData = {
            timeframe: @json($timeframe),
            senders: @json($senders)
        };
    </script>

    <div id="Management"></div>
</body>
</html>
