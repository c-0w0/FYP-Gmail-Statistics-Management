import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Table } from 'reactstrap';
import axios from 'axios';
import '../../css/app.css';

export default class Management extends Component {
    constructor() {
        super();
        this.state = {
            timeframe: window.managementData?.timeframe || 0,
            senders: window.managementData?.senders || [],  

            startDate: '',

            emailBySender: [],
            selectedMessageIds: [],

            modalData: [],
            modalTitle: '',
            modal0_open: false,
            sortOption: 'latest_contact_time', // Default sort option
        };

        this.modal0_toggle = this.modal0_toggle.bind(this);
        this.sortTable = this.sortTable.bind(this);
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

    modal0_toggle() {
        this.setState({ modal0_open: !this.state.modal0_open });
    }

    sortTable(event) {
        const criteria = event.target.value;
        const sortedSenders = [...this.state.senders].sort((a, b) => {
            if (criteria === 'frequency') {
                return b.frequency - a.frequency;
            } else if (criteria === 'latest_contact_time') {
                return new Date(b.latest_contact_time) - new Date(a.latest_contact_time);
            }
            return 0;
        });

        this.setState({
            sortOption: criteria,
            senders: sortedSenders
        });
    }

    confirmAction(action, account) {
        if (confirm(`Are you sure you want to ${action} the sender: ${account}?`)) {
            this.performAction(action, account);
        }
        return false;
    }

    performAction(action, account) {
        const label = 'Blocked';
        axios.post(`/api/${account}&${label}/blockEmail`)
            .then(response => {
                if (response.data.success) {
                    alert(`${action} action was successful. ${response.data.message}`);
                } else {
                    alert(`Failed to ${action}: ${response.data.message}`);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert(`An error occurred while performing the action.`);
            });
    }

    fetchEmailBySender(account) {
        return fetch(`/api/fetchEmailBySender/${account}&${this.state.timeframe}`)
            .then((response) => {
                if (!response.ok) throw new Error('Management.jsx -> fetchEmailBySender: Network response was not ok: ' + response.statusText);
                return response.json();
            })
            .then((data) => {
                this.setState({modalData: data, modalTitle: `Email(s) from ${account} - ${this.state.timeframe} days`});
                this.modal0_toggle()
            })
            .catch((error) => {
                console.error('Management.jsx -> fetchEmailBySender: Error fetching data:', error);
            });
    }

    handleCheckboxChange = (e, messageId) => {
        this.setState((prevState) => {
            const { selectedMessageIds } = prevState;
            let updatedSelectedMessageIds;
    
            if (e.target.checked) {
                // Add the messageId to the selectedMessageIds array
                updatedSelectedMessageIds = [...selectedMessageIds, messageId];
            } else {
                // Remove the messageId from the selectedMessageIds array
                updatedSelectedMessageIds = selectedMessageIds.filter(id => id !== messageId);
            }
    
            // Log the updated selectedMessageIds array
            console.log(updatedSelectedMessageIds);
    
            return { selectedMessageIds: updatedSelectedMessageIds };
        });
    };
    
    markAsSpam = async (messageIds) => {
        try {
          // Loop through each messageId and send a POST request to the API
          const requests = messageIds.map(messageId =>
            axios.post(`/api/${messageId}/markAsSpam`)
          );
      
          // Await all the requests in parallel
          await Promise.all(requests);
          this.modal0_toggle();
          // Handle successful response
          console.log('All emails have been marked as spam.');
        } catch (error) {
          // Handle error
          console.error('An error occurred while marking emails as spam:', error);
        }
      };
    
    render() {
        const { timeframe, senders, sortOption } = this.state;
        const modalStyles = {
            modalDialog: { maxWidth: '90%' },
            modalBody: { maxHeight: '70vh', overflowY: 'auto' }
        };

        return (
            <div style={{ margin: '0 auto', width: '90%' }}>
                <h2>Senders in the Last {timeframe} Days</h2>

                <div style={{ marginBottom: '10px', display: 'flex', alignItems: 'center' }}>
                    <label style={{ fontWeight: 'bold', fontSize: '1.5rem', marginRight: '10px' }}>Sort by:</label>
                    <div className="sort-dropdown" style={{ marginRight: 'auto' }}>
                        <select value={sortOption} onChange={this.sortTable} style={{ padding: '8px 12px', fontSize: '1rem', borderRadius: '4px', border: '1px solid #ccc' }}>
                            <option value="latest_contact_time">Latest Contact Time</option>
                            <option value="frequency">Frequency</option>
                        </select>
                    </div>
                    <a href="https://mail.google.com/mail/u/0/#settings/filters" target="_blank" style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#007bff', textDecoration: 'none', marginLeft: '20px', padding: '6px 12px', borderRadius: '4px', border: '1px solid #007bff', display: 'inline-block', transition: 'background-color 0.3s, color 0.3s' }}>
                        To my filters
                    </a>
                </div>


                
                <table>
                    <thead>
                        <tr>
                            <th>Name</th><th>Account</th><th>Frequency</th><th>Last Contact Time</th><th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {senders.map((sender, index) => (
                            <tr key={index}>
                                <td>{sender.name || 'N/A'}</td>
                                <td>
                                    <a
                                        href={`https://mail.google.com/mail/u/0/#search/from:${encodeURIComponent(sender.account)}+after${this.state.startDate}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        {sender.account}
                                    </a>
                                </td>
                                <td>{sender.frequency}</td><td>{sender.latest_contact_time}</td>
                                <td style={{ textAlign: 'right' }}>
                                    {sender.unsubscribeUrl && (
                                        <span>
                                            <a href={sender.unsubscribeUrl} target="_blank" rel="noopener noreferrer"> Unsubscribe </a> |
                                        </span>
                                    )}
                                    <a href="#" onClick={() => this.fetchEmailBySender(sender.account)}> Mark as Spam </a>|
                                    <a href="#" onClick={() => this.confirmAction('block', sender.account)}> Block </a>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Modal0 */}
                <Modal isOpen={this.state.modal0_open} toggle={this.modal0_toggle} style={modalStyles.modalDialog}>
                    <ModalHeader toggle={this.modal0_toggle}>
                        {this.state.modalTitle}
                    </ModalHeader>
                    <ModalBody style={modalStyles.modalBody}>
                        <Table>
                            <thead>
                                <tr>
                                    <th></th><th>Title</th><th style={{ textAlign: 'right' }}>Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {this.state.modalData.map((item, index) => (
                                    <tr
                                        key={index}
                                        onClick={(e) => {
                                            // Only trigger redirect when clicking the row, but not the checkbox
                                            window.open(`https://mail.google.com/mail/u/0/#inbox/${item.messageId}`, '_blank');
                                            e.currentTarget.style.fontWeight = 'normal';
                                        }}
                                        style={{ cursor: 'pointer', fontWeight: item.isUnread ? 'bold' : 'normal' }}
                                    >
                                        <td>
                                            <input
                                                type="checkbox"
                                                onClick={(e) => e.stopPropagation()} // Prevent row click
                                                onChange={(e) => this.handleCheckboxChange(e, item.messageId)}
                                                checked={this.state.selectedMessageIds.includes(item.messageId)} // Check if messageId is selected
                                            />
                                        </td>
                                        <td>{item.title}</td>
                                        <td style={{ textAlign: 'right' }}>{item.time}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="secondary" onClick={() => this.markAsSpam(this.state.selectedMessageIds)}>
                            Report as spam
                        </Button>
                        <Button color="secondary" onClick={this.modal0_toggle}>
                            Close
                        </Button>
                    </ModalFooter>
                </Modal>
            </div>
        );
    }
}

if (document.getElementById('Management')) {
    ReactDOM.render(<Management />, document.getElementById('Management'));
}
