<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gmail Statistics</title>
    @vite(['resources/sass/app.scss', 'resources/js/app.js'])
</head>

<body style="background-color: #eeeeee;">
    @include('components.header')

    <div style="text-align: center; margin: 0 auto; width: 90%;">
        <form style='text-align: right' action="{{ url('/logout') }}" method="POST" style="margin-top: 20px;">
            @csrf
            <button type="submit" style="padding: 8px 12px; font-size: 1rem; border: 1px solid #ccc; border-radius: 4px; background-color: #f44336; color: white;">Logout</button>
        </form>
        
        <form action="{{ url('/stats') }}" method="GET">
            <label for="timeframe" style="font-weight: bold; font-size: 1.5rem; margin-right: 10px;">Select Time Frame:</label>
            <select name="timeframe" id="timeframe" onchange="this.form.submit()" style="padding: 8px 12px; font-size: 1rem; border: 1px solid #ccc; border-radius: 4px; background-color: #f9f9f9;">
                <option value="7" {{ request('timeframe') == 7 ? 'selected' : '' }}>7 Days</option>
                <option value="14" {{ request('timeframe') == 14 ? 'selected' : '' }}>14 Days</option>
                <option value="30" {{ request('timeframe') == 30 ? 'selected' : '' }}>30 Days</option>
            </select>
        </form>
    </div>
    <br>

    <script>
        window.statisticsData = {
            timeframe: @json($timeframe),
            sent: @json($sent),
            received: @json($received),
            recipients: @json($recipients),
            senders: @json($senders)
        };
    </script>

    <div id="Header"></div>
    <br><br>
    <div id="Chart_Heatmap_AreaChart"></div>
    <br><br>
    <div id="Chart2_PieChart"></div>
</body>
</html>
