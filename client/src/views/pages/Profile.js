import React, { Component } from 'react';
import { UserProfile } from '../../components/user-profile';

class Profile extends Component {
	render() {
		return (
			<div>
				<UserProfile userID={this.props.match.params.userID} />
			</div>
		);
	}
}

export default Profile;
