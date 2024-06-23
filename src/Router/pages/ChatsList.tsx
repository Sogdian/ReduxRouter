import React = require('react');
import { Link } from 'react-router-dom';

export const ChatsList = ({ chats }) => {
    const normalizedData = React.useMemo(() => normalizeData(chats), [chats]);
    return (
        <ul>
            {normalizedData.map(({ recipientName, id, timestamp, lastMessage }, index) => (
                <li key={index}>
                    {/* добавим ссылку на чат */}
                    <Link
                        to={{ pathname: `/list/${id}` }}
                        className={styles.chat}
                    >
                        <Avatar name={recipientName} />
                        <div className={styles.chatContent}>
                            <div className={styles.info}>
                                <span>{recipientName}</span>
                                <span>{getTimeFromTimestamp(timestamp)}</span>
                            </div>
                            <div className={styles.lastMessage}>
                                <span>{lastMessage.text}</span>
                            </div>
                        </div>
                    </Link>
                </li>
            ))}
        </ul>
    );
};