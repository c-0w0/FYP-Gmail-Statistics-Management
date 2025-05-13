import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { FaPaperPlane, FaEnvelope, FaUser, FaUsers } from 'react-icons/fa'; 
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Table, Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import axios from 'axios';
import { Chart } from 'react-chartjs-2';
import 'chart.js/auto'; 


import '../../css/app.css'; 

export default class Header extends Component {
    constructor() {
        super();
        this.state = {
            timeframe: window.statisticsData?.timeframe || 0,
            sent: window.statisticsData?.sent || 0,
            received: window.statisticsData?.received || 0,
            recipients: window.statisticsData?.recipients || 0,
            senders: window.statisticsData?.senders || 0,

            startDate: '',

            modalData: [],
            modalTitle: '',
            modal0_open: false,
            modal1_open: false,
            dropdownOpen: false,

            sortOption: 'time', // Default sort option
        };

        this.modal0_toggle = this.modal0_toggle.bind(this);
        this.modal1_toggle = this.modal1_toggle.bind(this);
        this.fetchModalData = this.fetchModalData.bind(this);
        this.modal1_toggleDropdown = this.modal1_toggleDropdown.bind(this);
        this.setSortOption = this.setSortOption.bind(this);
    }

    componentDidMount() {
        const timeframe = this.state.timeframe || 7; 
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - timeframe); 
    
        const year = startDate.getFullYear();
        const month = String(startDate.getMonth() + 1).padStart(2, '0'); 
        const day = String(startDate.getDate()).padStart(2, '0');
    
        const formattedDate = `%3A${year}%2F${month}%2F${day}`;
    
        this.setState({ startDate: formattedDate });
    }
    

// Statistics - 4 Basics (Modal) ====================================================================================================================

    modal0_toggle() {
        this.setState({ modal0_open: !this.state.modal0_open });
    }
    modal1_toggle() {
        this.setState({ modal1_open: !this.state.modal1_open });
    }
    modal1_toggleDropdown() {
        this.setState({ dropdownOpen: !this.state.dropdownOpen });
    }

    fetchModalData(iconType) {
        let title = '';
        
        switch (iconType) {
            case 'sent':
                title = 'Messages Sent - ' + this.state.timeframe + ' days';
                this.setState({modalTitle: title, modalData: this.state.sent})
                this.modal0_toggle()
                break;
            case 'received':
                title = 'Messages Received - ' + this.state.timeframe + ' days';
                this.setState({modalTitle: title, modalData: this.state.received})
                this.modal0_toggle()
                break;
            case 'recipients':
                title = 'Recipients - ' + this.state.timeframe + ' days';
                this.setState({modalTitle: title, modalData: this.state.recipients})
                this.modal1_toggle()
                break;
            case 'senders':
                title = 'Senders - ' + this.state.timeframe + ' days';
                this.setState({modalTitle: title, modalData: this.state.senders})
                this.modal1_toggle()
                break;
            default:
                break;
        }
    }
    setSortOption(option) {
        this.setState({ sortOption: option });
    }
    getSortedData() {
        const { modalData, sortOption } = this.state;

        return modalData.sort((a, b) => {
            if (sortOption === 'frequency') {
                return b.frequency - a.frequency; // Descending order
            } else if (sortOption === 'time') {
                return new Date(b.latest_contact_time) - new Date(a.latest_contact_time); // Descending order
            }
            return 0;
        });
    }

//====================================================================================================================

    render() {
        const modalStyles = {
            modalDialog: { maxWidth: '90%' },
            modalContent: { height: '100%', overflow: 'hidden' },
            modalBody: { maxHeight: '70vh', overflowY: 'auto' },
        };

        const sortedModalData = this.getSortedData();
        const sortOptionDisplay = this.state.sortOption === 'frequency' ? 'Frequency' : 'Latest Contact Time';

        return (
            <div>
                {/* 4 Icons */}
                <div 
                    style={{
                        display: 'flex',
                        justifyContent: 'space-around',
                        backgroundColor: '#f8f9fa',
                        padding: '20px 0',
                        borderBottom: '1px solid #ddd',
                    }}
                >
                    <div style={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => this.fetchModalData('sent')}>
                        <FaPaperPlane size={40} />
                        <p>Messages Sent</p>
                        <p>{(this.state.sent).length}</p>
                    </div>
                    <div style={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => this.fetchModalData('received')}>
                        <FaEnvelope size={40} />
                        <p>Messages Received</p>
                        <p>{(this.state.received).length}</p>
                    </div>
                    <div style={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => this.fetchModalData('recipients')}>
                        <FaUser size={40} />
                        <p>Recipients</p>
                        <p>{(this.state.recipients).length}</p>
                    </div>
                    <div style={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => this.fetchModalData('senders')}>
                        <FaUsers size={40} />
                        <p>Senders</p>
                        <p>{(this.state.senders).length}</p>
                    </div>
                </div>

                {/* Modal0 */}
                <Modal isOpen={this.state.modal0_open} toggle={this.modal0_toggle} style={modalStyles.modalDialog}>
                    <ModalHeader toggle={this.modal0_toggle}>
                        {this.state.modalTitle}
                    </ModalHeader>
                    <ModalBody style={modalStyles.modalBody}>
                        <Table>
                            <thead>
                                <tr>
                                    <th>Name</th><th>Account</th><th>Title</th><th style={{ textAlign: 'right' }}>Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {this.state.modalData.map((item, index) => (
                                    <tr
                                        key={index}
                                        onClick={(e) => {window.open(`https://mail.google.com/mail/u/0/#inbox/${item.messageId}`, '_blank');
                                            e.currentTarget.style.fontWeight = 'normal';
                                        }}
                                        style={{ cursor: 'pointer', fontWeight: item.isUnread ? 'bold' : 'normal', }}
                                    >
                                        <td>{item.name}</td><td>{item.account}</td><td>{item.title}</td><td style={{ textAlign: 'right' }}>{item.time}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="secondary" onClick={this.modal0_toggle}>
                            Close
                        </Button>
                    </ModalFooter>
                </Modal>

                {/* Modal1 */}
                <Modal isOpen={this.state.modal1_open} toggle={this.modal1_toggle} style={modalStyles.modalDialog}>
                    <ModalHeader toggle={this.modal1_toggle}>
                        {this.state.modalTitle}
                        <Dropdown isOpen={this.state.dropdownOpen} toggle={this.modal1_toggleDropdown} style={{ marginLeft: '10px' }}>
                            <DropdownToggle caret>
                                Sort By: {sortOptionDisplay}
                            </DropdownToggle>
                            <DropdownMenu>
                                <DropdownItem active={this.state.sortOption === 'frequency'} onClick={() => this.setSortOption('frequency')}>
                                    Frequency
                                </DropdownItem>
                                <DropdownItem active={this.state.sortOption === 'time'} onClick={() => this.setSortOption('time')}>
                                    Latest Contact Time
                                </DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                    </ModalHeader>
                    <ModalBody style={modalStyles.modalBody}>
                        <Table>
                            <thead>
                                <tr>
                                    <th>Name</th><th>Account</th><th>Frequency</th><th style={{ textAlign: 'right' }}>Latest Contact Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedModalData.map((item, index) => (
                                    <tr
                                        key={index}
                                        onClick={() => window.open(`https://mail.google.com/mail/u/0/#search/${encodeURIComponent(item.account)}+after${this.state.startDate}`,'_blank')}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <td>{item.name}</td><td>{item.account}</td><td>{item.frequency}</td><td style={{ textAlign: 'right' }}>{item.latest_contact_time}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="secondary" onClick={this.modal1_toggle}>
                            Close
                        </Button>
                    </ModalFooter>
                </Modal>
            </div>
        );
    }
}

if (document.getElementById('Header')) {
    ReactDOM.render(<Header />, document.getElementById('Header'));
}
