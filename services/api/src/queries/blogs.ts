import type { Blog } from "../../../../common/src/services/types";
import { blogsKey, blogTagsKey } from "../../../../common/src/services/keys";
import { DateTime } from "luxon";
import { client } from "../db";

export const getBlogs = async () => {

  const scanHResults = await client.scan(
    0, 
    {
        MATCH: 'blogs*',
        COUNT: 100,
        TYPE: 'hash'
    }
  );

  //console.log("Existing hashes: ", scanHResults.keys);

  const ids = scanHResults.keys.map(key => {
    return key.substring(key.indexOf(':') + 1);
  });

  const fetchBlogs = ids.map((id) => {
    return client.hGetAll(blogsKey(id));
  });

  const blogs = await Promise.all(fetchBlogs);

  return blogs.map(async (blog, i) => {

    if(Object.keys(blog).length === 0) {
      return null;
    }

    const tags = await client.sMembers(blogTagsKey(ids[i]));
    const deserialized = deserialize(ids[i], tags, blog);

    //console.log(deserialized);
    
    return deserialized;
  });

}

const deserialize = (id: string, tags: string[], blog: {[key: string]: string}): Blog => {
    return {
        id,
        title: blog.title,
        author: blog.author,
        publishDate: DateTime.fromMillis(parseInt(blog.publishDate)),
        imageUrl: blog.imageUrl,
        guidUrl: blog.guidUrl,
        tags
    };
}
