import React from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import axios from 'axios';
import Cookie from 'js-cookie';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faUser, faLock } from '@fortawesome/free-solid-svg-icons';
import { BASE_URL } from '../../constants/api-routes';
import { LoadingSpinner } from '../loading-spinner';
import { Jumbotron, Row, Col } from 'reactstrap';
import './ChannelDetails.scss';
import ChannelMemberList from "./ChannelMemberList";
import ChannelOwnerList from './ChannelOwnerList';
import { Notification } from '../notification';

class ChannelDetails extends React.Component {
    static propTypes = {
        match: PropTypes.object.isRequired
    }

    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
            fetchSucceeded: false,
            channel: {}
        };
    }

    UNSAFE_componentWillMount() {
        this.setState({
            isLoading: true
        });
        const currUserToken = Cookie.get("token");
        if (currUserToken) {
            axios.get(`${BASE_URL}/channels/details?token=${currUserToken}&channel_id=${this.props.match.params.channelID}`)
                .then((res) => {
                    this.setState({
                        isLoading: false,
                        fetchSucceeded: true,
                        channel: res.data
                    });
                })
                .catch((err) => {
                    this.setState({
                        isLoading: false,
                        fetchSucceeded: false
                    })
                })
        } else {
            this.setState({
                isLoading: false,
                fetchSucceeded: false
            });
            Notification.spawnNotification("Failed", "Please log in first", "danger");
        }
    }

    render() {
        const { name, description, visibility, channel_img_url, channel_cover_img_url, all_members, owner_members } = this.state.channel;
        return (
            (this.state.isLoading) ?
                <LoadingSpinner /> :
                (!this.state.fetchSucceeded) ?
                    <p>Fetch failed. Is the backend running?</p> :
                    <Jumbotron className="channel-header-jumbotron" 
                                style={{"backgroundImage": (channel_cover_img_url != null) ? (
                                    `url('${channel_cover_img_url}')`
                                ) : (
                                   `linear-gradient(90deg, rgba(2,0,36,1) 0%, rgba(9,9,121,1) 45%, rgba(0,212,255,1) 100%)`
                                ) }}>
                        <div className="channel-card">
                            <img className="channel-image b-circle" src={channel_img_url} style={{ width: "200px", height: "200px" }} alt="Channel Image"  />
                            <h1 className="channel-name display-3">
                                {name + " "} 
                                {(visibility == "public") ? (<></>) : (<FontAwesomeIcon icon={faLock} />)}
                            </h1>
                            <p className="channel-description lead">{description}</p>
                            <hr className="channel-divider" />
                            <br />
                            <Row>
                                <Col md={6}>
                                    <h3 className="secondary-title">Members:</h3>
                                    <ChannelMemberList members={all_members} owners={owner_members} />
                                </Col>
                                <Col md={6}>
                                    <h3 className="secondary-title">Owners:</h3>
                                    <ChannelOwnerList owners={owner_members} />
                                </Col>
                            </Row>
                        </div>
                    </Jumbotron>
        );
    }
}

export default withRouter(ChannelDetails);
