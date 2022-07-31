import type { CreateBlogAttrs } from "../../../../common/src/services/types";
//import { genId } from "../../../../common/src/services/utils";
import { blogsKey, blogTagsKey } from "../../../../common/src/services/keys";
import { DateTime } from "luxon";
import { client } from "../db";

export const saveBlogs = async (attrsArray:CreateBlogAttrs[]) => {

  const scanHResults = await client.scan(
    0, 
    {
        MATCH: 'blogs*',
        COUNT: 100,
        TYPE: 'hash'
    }
  );

  console.log("Existing hashes: ", scanHResults);

  const scanSResults = await client.scan(
    0, 
    {
        MATCH: 'blogs*',
        COUNT: 100,
        TYPE: 'set'
    }
  );

  console.log("Existing sorts: ", scanSResults);

  attrsArray.forEach(async attrs => {
    const blogId = await saveBlog(attrs);
  });
}

const saveBlog = async (attrs:CreateBlogAttrs) => {
  const id = attrs.guidUrl.split("/").pop();

  const serialized = serialize(attrs);
  
  console.log(serialized);

  await Promise.all([
    client.hSet(blogsKey(id), serialized),
    attrs.tags.forEach(tag => {
       client.sAdd(blogTagsKey(id), tag) 
    }),
  ]);
  
  console.log("Blog saved with id ", id);

  return id;
};

const serialize = (blog: CreateBlogAttrs) => {
    return {
        title: blog.title,
        author: blog.author,
        publishDate: DateTime.fromRFC2822(blog.publishDate).toMillis(),
        imageUrl: blog.imageUrl,
        guidUrl: blog.guidUrl
    }
}
