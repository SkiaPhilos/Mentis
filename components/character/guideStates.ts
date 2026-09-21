export type GuideEmotion =
  | 'idle'
  | 'blink'
  | 'smile'
  | 'curious'
  | 'surprised'
  | 'confused'
  | 'concerned'
  | 'sleepy'
  | 'celebratory'
  | 'pointing'
  | 'presenting'
  | 'thinking'
  | 'listening';

export interface GuideMessage {
  text: string;
  actionLabel?: string;
  onAction?: () => void;
}
