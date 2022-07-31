import type { DateTime } from 'luxon';

export interface Blog {
    id: string;
    title: string;
    author: string;
    publishDate: DateTime;
    imageUrl: string;
    guidUrl: string;
    tags: string[];
}

export interface CreateBlogAttrs {
    title: string;
    author: string;
    publishDate: string;
    imageUrl: string;
    guidUrl: string;
    tags: string[];
}
