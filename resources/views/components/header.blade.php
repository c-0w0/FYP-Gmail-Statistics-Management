<nav style="display: flex; justify-content: space-around; background-color: #f8f9fa; padding: 10px 0; border-bottom: 1px solid #ddd;">
    <!-- Statistics Link -->
    <a href="{{ url('/stats') }}" 
       style="flex: 1; 
              text-align: center; 
              text-decoration: none; 
              color: {{ request()->is('stats*') ? 'white' : '#007bff' }}; 
              background-color: {{ request()->is('stats*') ? '#007bff' : 'transparent' }}; 
              font-size: 18px; 
              padding: 10px 0;">
       Statistics
    </a>

    <!-- Management Link -->
    <a href="{{ url('/management') }}" 
       style="flex: 1; 
              text-align: center; 
              text-decoration: none; 
              color: {{ request()->is('management*') ? 'white' : '#007bff' }}; 
              background-color: {{ request()->is('management*') ? '#007bff' : 'transparent' }}; 
              font-size: 18px; 
              padding: 10px 0;">
       Management
    </a>
</nav>
