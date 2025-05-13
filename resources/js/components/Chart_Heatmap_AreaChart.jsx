import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import ReactApexChart from 'react-apexcharts';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Table } from 'reactstrap';

export default class Chart_Heatmap_AreaChart extends Component {
    constructor(props) {
        super(props);
        this.state = {
            timeframe: window.statisticsData?.timeframe || 0,

            sendersData: [],
            allMessagesA: [],
            heatmapA_data: [], // State for heatmap data
            
            allMessagesB: [],
            heatmapB_data: [], // State for heatmap data
            
            areaChartA_data: [],
            areaChartA_categories: [],
            areaChartB_data: [],
            areaChartB_categories: [],

            modalData: [], // Data to be displayed in the modal
            modalTitle: '', // Title to show which icon was clicked
            modalOpen: false, // Modal visibility state
        };

        this.modalToggle = this.modalToggle.bind(this);
        this.heatmapA_clicked = this.heatmapA_clicked.bind(this);
        this.heatmapB_clicked = this.heatmapB_clicked.bind(this);
    }

    modalToggle() {
        this.setState({ modalOpen: !this.state.modalOpen });
    }

    componentDidMount() {
        this.fetchData()
    }

    fetchData = () => {
        const { timeframe } = this.state;

        // Fetch data for both charts concurrently
        Promise.all([
            this.fetchSentMessagesData(timeframe),
            this.fetchReceivedMessagesData(timeframe),
            this.fetchSentMessagesPerDayData(timeframe),
            this.fetchReceivedMessagesPerDayData(timeframe),
        ])
        .then(() => {
            console.log('Chart_Heatmap_AreaChart.jsx: Rendered successfully.');
        })
        .catch((error) => {
            console.error('Chart_Heatmap_AreaChart.jsx: Error - ', error);
        });
    };

// HeatmapA - SENT ====================================================================================================================

    fetchSentMessagesData = (days) => {
        // Fetch received messages data from the server and prepare it for the heatmap
        return fetch(`/api/charts/heatmap/sent/${days}`)
            .then((response) => {
                if (!response.ok) throw new Error('Chart1A: Network response was not ok: ' + response.statusText);
                return response.json();
            })
            .then((data) => {
                this.setState({allMessagesA: data});
                this.heatmapA_preprocess(data);
            })
            .catch((error) => {
                console.error('Chart_Heatmap_AreaChart.jsx -> HeatmapA: Error fetching data:', error);
            });
    };

    heatmapA_preprocess = (data) => {
        const hours = [
            '2300', '2200', '2100', '2000', '1900', '1800', '1700', '1600',
            '1500', '1400', '1300', '1200', '1100', '1000', '0900', '0800',
            '0700', '0600', '0500', '0400', '0300', '0200', '0100', '0000'
        ];
        const days = [
            'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
        ];
    
        const heatmapA_data = hours.map((hour) => {
            return {
                name: hour,
                data: days.map((day) => {
                    const hourData = data[day]?.[hour] || { count: 0, messages: [] };
                    return {
                        x: day,
                        y: hourData.count, // Count of messages for the day and hour
                        messageIds: hourData.messages.map(message => message.messageId), // Array of message IDs
                        hour,
                    };
                }),
            };
        });
    
        this.setState({ heatmapA_data });
    };
        
    heatmapA_clicked = (event, chartContext, config) => {
        const { seriesIndex, dataPointIndex } = config;
        const clickedPoint = this.state.heatmapA_data[seriesIndex].data[dataPointIndex];
    
        if (clickedPoint) {
            const { x: day, y, hour, messageIds } = clickedPoint;
    
            const messages = messageIds.map((messageId) => {
                const hourData = this.state.allMessagesA[day]?.[hour];
                if (hourData && hourData.messages) {
                    // Find the message object by messageId
                    return hourData.messages.find(msg => msg.messageId === messageId);
                }
                return null;
            }).filter(msg => msg);

            const modalTitle = messages.length > 0
            ? `Emails sent on ${day}(s) at ${hour}`
            : `No emails sent on ${day}(s) at ${hour}`;


            this.setState({
                modalData: messages,
                modalTitle,
                modalOpen: true, // Toggle the modal open
            });

        }
    };
            
    heatmapA_draw = () => {
        // Options for the heatmap
        const options = {
            chart: {
                height: 500,
                type: 'heatmap',
                events: {
                    dataPointSelection: (event, chartContext, config) => { 
                        this.heatmapA_clicked(event, chartContext, config)}
                }
            },
            dataLabels: {
                enabled: false,
            },
            colors: ['#008FFB'],
            title: {
                text: 'by Hour and Day',
                align: 'center',
                // style: {
                //     fontSize: '20px',
                //     fontWeight: 'bold',
                // },
            },
            xaxis: {
                categories: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
            },
            yaxis: {
                categories: ['2300', '2200', '2100', '2000', '1900', '1800', '1700', '1600', '1500', '1400', '1300', '1200', '1100', '1000', '0900', '0800', '0700', '0600', '0500', '0400', '0300', '0200', '0100', '0000'], // Reversed order
            },
        };

        return (
            <ReactApexChart
                options={options}
                series={this.state.heatmapA_data}
                type="heatmap"
                height={600}
                width={300}
            />
        );
    };

// HeatmapB - RECEIVED ====================================================================================================================

    fetchReceivedMessagesData = (days) => {
        // Fetch received messages data from the server and prepare it for the heatmap
        return fetch(`/api/charts/heatmap/received/${days}`)
            .then((response) => {
                if (!response.ok) throw new Error('Chart1B: Network response was not ok: ' + response.statusText);
                return response.json();
            })
            .then((data) => {
                this.setState({allMessagesB: data});
                this.heatmapB_preprocess(data);
            })
            .catch((error) => {
                console.error('Chart_Heatmap_AreaChart.jsx -> HeatmapB: Error fetching data:', error);
            });
    };

    heatmapB_preprocess = (data) => {
        const hours = [
            '2300', '2200', '2100', '2000', '1900', '1800', '1700', '1600',
            '1500', '1400', '1300', '1200', '1100', '1000', '0900', '0800',
            '0700', '0600', '0500', '0400', '0300', '0200', '0100', '0000'
        ];
        const days = [
            'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
        ];

        const heatmapB_data = hours.map((hour) => {
            return {
                name: hour,
                data: days.map((day) => {
                    const hourData = data[day]?.[hour] || { count: 0, messages: [] };
                    return {
                        x: day,
                        y: hourData.count, // Count of messages for the day and hour
                        messageIds: hourData.messages.map(message => message.messageId), // Array of message IDs
                        hour,
                    };
                }),
            };
        });

        this.setState({ heatmapB_data });
    };
        
    heatmapB_clicked = (event, chartContext, config) => {
        const { seriesIndex, dataPointIndex } = config;
        const clickedPoint = this.state.heatmapB_data[seriesIndex].data[dataPointIndex];

        if (clickedPoint) {
            const { x: day, y, hour, messageIds } = clickedPoint;

            const messages = messageIds.map((messageId) => {
                const hourData = this.state.allMessagesB[day]?.[hour];
                if (hourData && hourData.messages) {
                    // Find the message object by messageId
                    return hourData.messages.find(msg => msg.messageId === messageId);
                }
                return null;
            }).filter(msg => msg);

            const modalTitle = messages.length > 0
            ? `Emails received on ${day}(s) at ${hour}`
            : `No emails received on ${day}(s) at ${hour}`;


            this.setState({
                modalData: messages,
                modalTitle,
                modalOpen: true, // Toggle the modal open
            });

        }
    };
            
    heatmapB_draw = () => {
        // Options for the heatmap
        const options = {
            chart: {
                height: 500,
                type: 'heatmap',
                events: {
                    dataPointSelection: (event, chartContext, config) => { 
                        this.heatmapB_clicked(event, chartContext, config)}
                }
            },
            dataLabels: {
                enabled: false,
            },
            colors: ['#008FFB'],
            title: {
                text: 'by Hour and Day',
                align: 'center',
                // style: {
                //     fontSize: '20px',
                //     fontWeight: 'bold',
                // },
            },
            xaxis: {
                categories: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
            },
            yaxis: {
                categories: ['2300', '2200', '2100', '2000', '1900', '1800', '1700', '1600', '1500', '1400', '1300', '1200', '1100', '1000', '0900', '0800', '0700', '0600', '0500', '0400', '0300', '0200', '0100', '0000'], // Reversed order
            },
        };

        return (
            <ReactApexChart
                options={options}
                series={this.state.heatmapB_data}
                type="heatmap"
                height={600}
                width={300}
            />
        );
    };

// AreaA - SENT ====================================================================================================================

    fetchSentMessagesPerDayData = (days) => {
        // Fetch sent messages per day from the server and prepare it for the area chart
        return fetch(`/api/charts/area/sent/${days}`)
            .then((response) => {
                if (!response.ok) throw new Error('AreaChartA: Network response was not ok: ' + response.statusText);
                return response.json();
            })
            .then((data) => {
                this.areaChartA_preprocess(data);
            })
            .catch((error) => {
                console.error('Chart_Heatmap_AreaChart.jsx -> AreaChartA: Error fetching data:', error);
            });
    };

    areaChartA_preprocess = (data) => {
        // Process data to prepare it for the Area Chart
        const seriesData = Object.keys(data).map((date) => ({
            x: new Date(date).getTime(), // Convert date to timestamp (in milliseconds)
            y: data[date], // The count of emails for that specific day
        }));

        const areaChartA_data = [{
            name: 'Sent Messages',
            data: seriesData,
        }];

        const categories = Object.keys(data).map((date) => new Date(date).toISOString().split('T')[0]); // Extract and format the categories for the x-axis (dates)

        this.setState({ areaChartA_data: areaChartA_data, areaChartA_categories: categories });
    };

    areaChartA_draw = () => {
        const options = {
            chart: {
                type: 'area',
                toolbar: { show: false },
                zoom: { enabled: false },
                events: {
                    click: (event, chartContext, opts) => {
                        if (opts.dataPointIndex !== -1) {
                            const clickedTimestamp = opts.config.series[0].data[opts.dataPointIndex].x;
                            const clickedDate = new Date(clickedTimestamp);
    
                            const year1 = clickedDate.getFullYear();
                            const month1 = ('0' + (clickedDate.getMonth() + 1)).slice(-2);
                            const day1 = ('0' + clickedDate.getDate()).slice(-2);
                            const date1 = '%3A' + year1 + '%2F' + month1 + '%2F' + day1;

    
                            const nextDay = new Date(clickedDate);
                            nextDay.setDate(clickedDate.getDate() + 1); 
                            
                            const year2 = nextDay.getFullYear();
                            const month2 = ('0' + (nextDay.getMonth() + 1)).slice(-2);
                            const day2 = ('0' + nextDay.getDate()).slice(-2);
                            const date2 = '%3A' + year2 + '%2F' + month2 + '%2F' + day2;
    
                            // Gmail search URL with specific date filter
                            const gmailSearchUrl = `https://mail.google.com/mail/u/0/#search/in:sent+after${date1}+before${date2}`;
    
                            // Redirect user to Gmail search page
                            window.open(gmailSearchUrl, '_blank');
                        }
                    }
                }
            },
            dataLabels: { enabled: false },
            stroke: { curve: 'smooth' },
            xaxis: { type: 'datetime', title: { text: 'Date' }, labels: { show: true }, tickAmount: 10 },
            yaxis: { title: { text: 'Messages Sent' } },
            colors: ['#FF5733'],
            tooltip: { x: { format: 'yyyy-MM-dd' } },
            title: { text: 'Messages Sent by Day', align: 'center' },
            grid: { show: true },
            legend: { show: true }
        };
    
        return (<ReactApexChart options={options} series={this.state.areaChartA_data} type="area" height={350} />);
    };
        
// AreaB - RECEIVED ====================================================================================================================

    fetchReceivedMessagesPerDayData = (days) => {
        // Fetch sent messages per day from the server and prepare it for the area chart
        return fetch(`/api/charts/area/received/${days}`)
            .then((response) => {
                if (!response.ok) throw new Error('AreaChartB: Network response was not ok: ' + response.statusText);
                return response.json();
            })
            .then((data) => {
                this.areaChartB_preprocess(data);
            })
            .catch((error) => {
                console.error('Chart_Heatmap_AreaChart.jsx -> AreaChartB: Error fetching data:', error);
            });
    };
    areaChartB_preprocess = (data) => {
        const seriesData = Object.keys(data).map((date) => ({
            x: new Date(date).getTime(), // Convert date to timestamp (in milliseconds)
            y: data[date], // The count of emails for that specific day
        }));
    
        const areaChartB_data = [{
            name: 'Received Messages',
            data: seriesData, 
        }];
    
        const categories = Object.keys(data).map((date) => new Date(date).toISOString().split('T')[0]); // Extract and format the categories for the x-axis (dates)
        
        this.setState({ areaChartB_data: areaChartB_data, areaChartB_categories: categories }); // Set the chart data and categories in the state
    };
    
    areaChartB_draw = () => {
        const options = {
            chart: {
                type: 'area',
                toolbar: { show: false },
                zoom: { enabled: false },
                events: {
                    click: (event, chartContext, opts) => {
                        if (opts.dataPointIndex !== -1) {
                            const clickedTimestamp = opts.config.series[0].data[opts.dataPointIndex].x;
                            const clickedDate = new Date(clickedTimestamp);
    
                            const year1 = clickedDate.getFullYear();
                            const month1 = ('0' + (clickedDate.getMonth() + 1)).slice(-2);
                            const day1 = ('0' + clickedDate.getDate()).slice(-2);
                            const date1 = '%3A' + year1 + '%2F' + month1 + '%2F' + day1;

    
                            const nextDay = new Date(clickedDate);
                            nextDay.setDate(clickedDate.getDate() + 1); 
                            
                            const year2 = nextDay.getFullYear();
                            const month2 = ('0' + (nextDay.getMonth() + 1)).slice(-2);
                            const day2 = ('0' + nextDay.getDate()).slice(-2);
                            const date2 = '%3A' + year2 + '%2F' + month2 + '%2F' + day2;
    
                            // Gmail search URL with specific date filter
                            const gmailSearchUrl = `https://mail.google.com/mail/u/0/#search/in:inbox+after${date1}+before${date2}`;
    
                            // Redirect user to Gmail search page
                            window.open(gmailSearchUrl, '_blank');
                        }
                    }
                }
            },
            dataLabels: { enabled: false },
            stroke: { curve: 'smooth' },
            xaxis: { type: 'datetime', title: { text: 'Date' }, labels: { show: true }, tickAmount: 10 },
            yaxis: { title: { text: 'Messages Received' } },
            colors: ['#FF5733'],
            tooltip: { x: { format: 'yyyy-MM-dd' } },
            title: { text: 'Messages Received by Day', align: 'center' },
            grid: { show: true },
            legend: { show: true }
        };
    
        return (<ReactApexChart options={options} series={this.state.areaChartB_data} type="area" height={350} />);
    };
                
//====================================================================================================================

    render() {
        const chartStyle = {
            chartContainer: { display: 'flex', gap: '20px', marginLeft: '5%', elevation: 2 },
            chart0: { width: '100%', height: '100%' },
            chart1: { width: '100%', height: '100%' },
        };
        const modalStyles = {
            modalDialog: { maxWidth: '90%' },
            modalContent: { height: '100%', overflow: 'hidden' },
            modalBody: { maxHeight: '70vh', overflowY: 'auto' },
        };
        const boxStyle = {
            boxContainer0: {
                height: '700px',
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
            boxContainer1: {
                height: '450px',
                width: '800px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                padding: '20px',
                backgroundColor: '#fff',
            },
        };

        return (
            <div>
            <div className="chart-container" style={chartStyle.chartContainer}>
                <>
                    {/* Heatmap A Container */}
                    <div style={boxStyle.boxContainer0}>
                        <div style={boxStyle.boxHeader}>Sent Emails Heatmap</div>
                        <div id="heatmap" className="chart" style={chartStyle.chart0}>
                            {this.heatmapA_draw()}
                        </div>
                    </div>

                    {/* Heatmap B Container */}
                    <div style={boxStyle.boxContainer0}>
                        <div style={boxStyle.boxHeader}>Received Emails Heatmap</div>
                        <div id="heatmap" className="chart" style={chartStyle.chart0}>
                            {this.heatmapB_draw()}
                        </div>
                    </div>

                    <div>
                        {/* AreaChart A Container */}
                        <div style={boxStyle.boxContainer1}>
                            <div style={boxStyle.boxHeader}>Sent Messages Area Chart</div>
                            <div id="areaChartA" className="chart" style={chartStyle.chart1}>{this.areaChartA_draw()}</div>
                        </div> <br></br>
                        {/* AreaChart B Container */}
                        <div style={boxStyle.boxContainer1}>
                            <div style={boxStyle.boxHeader}>Received Messages Area Chart</div>
                            <div id="areaChartB" className="chart" style={chartStyle.chart1}>{this.areaChartB_draw()}</div>
                        </div>
                    </div>
                    
                        
                </>
            </div>
                {/* Modal */}
                <Modal isOpen={this.state.modalOpen} toggle={this.modalToggle} style={modalStyles.modalDialog}>
                    <ModalHeader toggle={this.modalToggle}>
                        {this.state.modalTitle}
                    </ModalHeader>
                    <ModalBody style={modalStyles.modalBody}>
                        <Table>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Account</th>
                                    <th>Title</th>
                                    <th style={{ textAlign: 'right' }}>Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {this.state.modalData.map((item, index) => (
                                    <tr
                                        key={index}
                                        onClick={(e) => {
                                            // Open the email in a new tab
                                            window.open(`https://mail.google.com/mail/u/0/#inbox/${item.messageId}`, '_blank');

                                            // Set the font weight to normal to indicate the message has been read
                                            e.currentTarget.style.fontWeight = 'normal';

                                            // Optionally, you could also update the state to reflect the read status
                                            this.setState(prevState => {
                                                const updatedmodalA_data = [...prevState.modalData];
                                                updatedmodalA_data[index].isUnread = false; // Mark as read
                                                return { modalData: updatedmodalA_data };
                                            });
                                        }}
                                        style={{
                                            cursor: 'pointer',
                                            fontWeight: item.isUnread ? 'bold' : 'normal',
                                        }}
                                    >
                                        <td>{item.name}</td>
                                        <td>{item.account}</td>
                                        <td>{item.title}</td>
                                        <td style={{ textAlign: 'right' }}>{item.time}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="secondary" onClick={this.modalToggle}>
                            Close
                        </Button>
                    </ModalFooter>
                </Modal>
            </div>
        );
    }
}

if (document.getElementById('Chart_Heatmap_AreaChart')) {
    ReactDOM.render(<Chart_Heatmap_AreaChart />, document.getElementById('Chart_Heatmap_AreaChart'));
}
