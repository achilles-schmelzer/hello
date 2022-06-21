import { ContentTypeId, ContentCodec, EncodedContent } from '@xmtp/xmtp-js';

const GROUP_MESSAGE_FALLBACK =
  "This was a group message, but your client doesn't support group messaging yet. See https://docs.xmtp.org/client-sdk/content-types";

// TODO content should be maybe generic?
export interface GroupMessageContent {
  memberAddresses: string[];
  content: string;
}

export const CONTENT_TYPE_GROUP_MESSAGE = new ContentTypeId({
  authorityId: 'daopanel.com',
  typeId: 'group message',
  versionMajor: 0,
  versionMinor: 1,
});

export class GroupMessageCodec implements ContentCodec<GroupMessageContent> {
  get contentType(): ContentTypeId {
    return CONTENT_TYPE_GROUP_MESSAGE;
  }

  public encode(content: GroupMessageContent): EncodedContent {
    return {
      type: CONTENT_TYPE_GROUP_MESSAGE,
      parameters: {},
      // TODO Think harder about this.
      fallback: `
        Notice: ${GROUP_MESSAGE_FALLBACK}
        Members: ${content.memberAddresses.join(',')}
        Text: ${content.content}
      `,
      content: new TextEncoder().encode(JSON.stringify(content)),
    };
  }

  public decode(content: EncodedContent): GroupMessageContent {
    const bytes = new TextDecoder().decode(content.content);
    // TODO Validation.
    return JSON.parse(bytes) as GroupMessageContent;
  }
}
