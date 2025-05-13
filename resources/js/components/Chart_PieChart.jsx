import React, { Component } from 'react';
import ReactDOM from 'react-dom';

export default class Chart2_PieChart extends Component {
    constructor(props) {
        super(props);
        this.state = {
            timeframe: window.statisticsData?.timeframe || 0,
            isGoogleChartsLoaded: false,
            allMessages: [],
        };
    }

    componentDidMount() {
        this.loadGoogleCharts(); // Load Google Charts when the component mounts
    }

    loadGoogleCharts = () => {
        // Create a script element to load the Google Charts library
        const script = document.createElement('script');
        script.src = 'https://www.gstatic.com/charts/loader.js';
        script.onload = () => {
            google.charts.load('current', { packages: ['corechart'] });
            google.charts.setOnLoadCallback(this.handleGoogleChartsLoaded);
        };
        document.body.appendChild(script);
    };

    handleGoogleChartsLoaded = () => {
        this.setState({ isGoogleChartsLoaded: true }, this.fetchData);
    };

    fetchData = () => {
        const { timeframe } = this.state;

        // Fetch data for both charts concurrently
        Promise.all([
            this.fetchRecipientsData(timeframe), 
            this.fetchSendersData(timeframe), 
            this.fetchReadStatusData(timeframe)
        ])
        .then(() => {
            console.log('Chart_PieChart.jsx: Rendered successfully.');
        })
        .catch((error) => {
            console.error('Chart_PieChart.jsx: Error:', error);
        });
    };

// PieChartA - SENT ====================================================================================================================

    fetchRecipientsData = (days) => {
        // Fetch senders data from the server and draw the chart
        return fetch(`/api/charts/pie/recipients/${days}`)
            .then((response) => {
                if (!response.ok) throw new Error('Network response was not ok: ' + response.statusText);
                return response.json();
            })
            .then((data) => {
                this.pieChartA_draw(data);
            })
            .catch((error) => {
                console.error('Chart_PieChart.jsx -> PieChartA: Error - ', error);
            });
    };

    pieChartA_draw = (recipientsData) => {
        const senderCounts = {};
        recipientsData.forEach((sender) => {
            const { name, account, frequency } = sender; // Destructure to include account (email)
            if (!senderCounts[account]) senderCounts[account] = { count: 0, name };
            senderCounts[account].count += frequency;
        });

        const dataArray = [['Sender', 'Frequency', 'Account']];
        for (const [account, { count, name }] of Object.entries(senderCounts)) {
            dataArray.push([name, count, account]); // Include account in the data array
        }

        dataArray.sort((a, b) => b[1] - a[1]); // Sort the dataArray based on frequency (descending order)

        const data = google.visualization.arrayToDataTable(dataArray);
        const options = {
            // title: 'Most Frequent Senders',
            pieHole: 0.4,
        };

        var chart = new google.visualization.PieChart(document.getElementById('pieChartA'));
        chart.draw(data, options);

        google.visualization.events.addListener(chart, 'select', () => { // Add event listener for selecting slices
            const selectedItem = chart.getSelection()[0];
            if (selectedItem) {
                const senderAccount = data.getValue(selectedItem.row, 2); // Get the sender's account (email)

                const days = this.state.timeframe;
                const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

                const year = startDate.getFullYear(); 
                const month = String(startDate.getMonth() + 1).padStart(2, '0'); 
                const day = String(startDate.getDate()).padStart(2, '0'); 

                const date = '%3A' + year + '%2F' + month + '%2F' + day;

                const gmailSearchUrl = `https://mail.google.com/mail/u/0/#search/from:${encodeURIComponent(senderAccount)}+after${date}`;

                window.open(gmailSearchUrl, '_blank');
            }
        });
    };

// PieChartB - RECEIVED ====================================================================================================================

    fetchSendersData = (days) => {
        return fetch(`/api/charts/pie/senders/${days}`)
            .then((response) => {
                if (!response.ok) throw new Error('Network response was not ok: ' + response.statusText);
                return response.json();
            })
            .then((data) => {
                this.pieChartB_draw(data);
            })
            .catch((error) => {
                console.error('Chart_PieChart.jsx -> PieChartB: Error - ', error);
            });
    };

    pieChartB_draw = (sendersData) => {
        // Aggregate data for the donut chart with sender email
        const senderCounts = {};
        sendersData.forEach((sender) => {
            const { name, account, frequency } = sender; // Destructure to include account (email)
            if (!senderCounts[account]) senderCounts[account] = { count: 0, name };
            senderCounts[account].count += frequency;
        });

        const dataArray = [['Sender', 'Frequency', 'Account']];
        for (const [account, { count, name }] of Object.entries(senderCounts)) {
            dataArray.push([name, count, account]); // Include account in the data array
        }

        dataArray.sort((a, b) => b[1] - a[1]); // Sort the dataArray based on frequency (descending order)

        const data = google.visualization.arrayToDataTable(dataArray);
        const options = {
            // title: 'Most Frequent Senders',
            pieHole: 0.4,
        };

        var chart = new google.visualization.PieChart(document.getElementById('pieChartB'));
        chart.draw(data, options);

        google.visualization.events.addListener(chart, 'select', () => { // Add event listener for selecting slices
            const selectedItem = chart.getSelection()[0];
            if (selectedItem) {
                const senderAccount = data.getValue(selectedItem.row, 2); // Get the sender's account (email)
                const days = this.state.timeframe;
                const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

                const year = startDate.getFullYear(); 
                const month = String(startDate.getMonth() + 1).padStart(2, '0'); 
                const day = String(startDate.getDate()).padStart(2, '0'); 

                const date = '%3A' + year + '%2F' + month + '%2F' + day;

                const gmailSearchUrl = `https://mail.google.com/mail/u/0/#search/from:${encodeURIComponent(senderAccount)}+after${date}`;

                window.open(gmailSearchUrl, '_blank'); 
            }
        });
    };

// PieChartC - READ % ====================================================================================================================

    fetchReadStatusData = (days) => {
        return fetch(`/api/charts/pie/readStatus/${days}`)
            .then((response) => {
                if (!response.ok) throw new Error('Network response was not ok: ' + response.statusText);
                return response.json();
            })
            .then((data) => {
                this.pieChartC_draw(data);
            })
            .catch((error) => {
                console.error('Chart_PieChart.jsx -> PieChartC: Error - ', error);
            });
    };

    pieChartC_draw = (sendersData) => {
        // Convert the read and unread counts into an array format for the chart
        const dataArray = [
            ['Status', 'Count'],
            ['Read', sendersData.read],
            ['Unread', sendersData.unread],
        ];
    
        // Create the data table for the chart
        const data = google.visualization.arrayToDataTable(dataArray);
        const options = {
            pieHole: 0.4,
            colors: ['#4caf50', '#f44336'], // Customize colors for read and unread
            pieSliceText: 'percentage',
            legend: {
                position: 'right',
                alignment: 'center',
                textStyle: {
                    fontSize: 12,
                },
            },
        };
    
        // Draw the Pie Chart
        const chart = new google.visualization.PieChart(document.getElementById('pieChartC'));
        chart.draw(data, options);
    
        // Add event listener for selecting slices
        google.visualization.events.addListener(chart, 'select', () => {
            const selectedItem = chart.getSelection()[0];
            if (selectedItem) {
                const status = data.getValue(selectedItem.row, 0); // Get the status (Read or Unread)
                
                const days = this.state.timeframe;
                const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
                // Format the start date for Gmail search filter
                const year = startDate.getFullYear();
                const month = String(startDate.getMonth() + 1).padStart(2, '0');
                const day = String(startDate.getDate()).padStart(2, '0');
    
                const date = `%3A${year}%2F${month}%2F${day}`;
    
                // Construct Gmail search URL based on selected status
                const searchQuery = status === 'Read' ? 'is:read' : 'is:unread';
                const gmailSearchUrl = `https://mail.google.com/mail/u/0/#search/${searchQuery}+after${date}`;
    
                // Open the Gmail search URL in a new tab
                window.open(gmailSearchUrl, '_blank');
            }
        });
    };
        
//====================================================================================================================

    render() {
        const chart1Style = {
            chartContainer: { display: 'flex', gap: '10px', marginLeft: '1%' },
            chart: { width: '103%', height: '90%'},
        };
        const boxStyle = {
            boxContainer: {
                height: '550px',
                width: '550px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                padding: '20px',
                backgroundColor: '#fff',
            },
            boxHeader: {
                fontSize: '18px',
                fontWeight: 'bold',
                marginBottom: '10px',
                textAlign: 'center',
            },
        }


        return (
            <div>
                <div className="chart-container" style={chart1Style.chartContainer}>
                    {this.state.isGoogleChartsLoaded ? (
                        <>
                            <div style={boxStyle.boxContainer}>
                                <div style={boxStyle.boxHeader}>Most Frequent Recipients</div>
                                <div id="pieChartA" className="chart" style={chart1Style.chart}></div>
                            </div>
                            <div style={boxStyle.boxContainer}>
                                <div style={boxStyle.boxHeader}>Most Frequent Senders</div>
                                <div id="pieChartB" className="chart" style={chart1Style.chart}></div>
                            </div>
                            <div style={boxStyle.boxContainer}>
                                <div style={boxStyle.boxHeader}>Read Status</div>
                                <div id="pieChartC" className="chart" style={chart1Style.chart}></div>
                            </div>
                        </>
                    ) : (
                        <div>Loading charts...</div>
                    )}
                </div>
            </div>
        );
    }
}

if (document.getElementById('Chart2_PieChart')) {
    ReactDOM.render(<Chart2_PieChart />, document.getElementById('Chart2_PieChart'));
}
