import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Card, CardBody } from 'reactstrap';

const Channel = ({ channel_id, name, image, description, isPublic }) => {
    return (
        <Card>
            <CardBody className="display-flex">
                <Link to={`/channel/${channel_id}`}>
                    <img
                        src={image}
                        style={{ width: 70, height: 70 }}
                        alt="Responsive"
                        aria-hidden={true}
                    />
                </Link>
                <div className="m-l">
                    <Link to={`/channel/${channel_id}`}>
                        <h2 className="h4">{name}</h2>
                    </Link>
                    {(isPublic) ? 
                        <em>Public Channel</em> :
                        <em>Private Channel</em>
                    }
                    <p className="text-muted">
                        {description}
                    </p>
                </div>
            </CardBody>
        </Card>
    );
}

Channel.propTypes = {
    name: PropTypes.string,
    description: PropTypes.string,
    image: PropTypes.string,  // TODO: Placeholder type. Eventually I want to upload image files
    isPublic: PropTypes.bool
};

Channel.defaultProps = {
    name: "Unnamed",
    description: "This channel's creator didn't set a description",
    image: "https://i.imgur.com/A2Aw6XG.png",  // TODO: Placeholder
    isPublic: true
};

export default Channel;
