import {
    Avatar,
    AvatarImage,
    AvatarFallback
} from "./ui/avatar";

// Chatbubbleに渡すpropsの型を定義
interface ChatBubbleProps {
    avatar: string | null;
    username: string;
    message: string;
    createdAt: string;
}

// ChatBubbleコンポーネントを定義

export const OtherChatBubble: React.FC<ChatBubbleProps> = ({ avatar, username, message, createdAt }) => {
    return (
        <div className="flex items-end space-x-2 my-4">
            <div className="grid place-items-center">
                <Avatar>
                    <AvatarImage src={avatar ?? "../anonymous-avatar.jpg"} alt="Jane Doe" />
                    <AvatarFallback>Anon</AvatarFallback>
                </Avatar>
                <p className="text-sm text-muted-foreground">{username}</p>
            </div>
            <div>
                <div className="p-2 bg-gray-200 rounded-lg">{message}</div>
                <p className="text-sm text-muted-foreground">{createdAt}</p>
            </div>
        </div>
    );
}

export const OwnChatBubble: React.FC<ChatBubbleProps> = ({ avatar, username, message, createdAt }) => {
    return (
        <div className="flex items-end justify-end space-x-2 my-4">
            <div>
                <div className="p-2 bg-gray-200 rounded-lg">{message}</div>
                <p className="text-sm text-muted-foreground text-right">{createdAt}</p>
            </div>
            <div className="grid place-items-center">
                <Avatar>
                    <AvatarImage src={avatar ?? "../anonymous-avatar.jpg"} alt="John Doe" />
                    <AvatarFallback>Anon</AvatarFallback>
                </Avatar>
                <p className="text-sm text-muted-foreground">{username}</p>
            </div>
        </div>
    )
}