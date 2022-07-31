import dotenv from 'dotenv';
import http from 'http';
import Parser from 'rss-parser';
import type { CreateBlogAttrs } from '../../../common/src/services/types';
import { saveBlogs } from './queries/blogs';
import { DateTime } from "luxon";
import nodeSchedule from 'node-schedule';

dotenv.config();

const hostname = 'localhost';
const port = 8000;

const server = http.createServer((req, res) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/plain');
            res.end('Background worker\n');
});

server.listen(port, hostname, () => {
            console.log(`Server running at http://${hostname}:${port}/`);
});

const parser = new Parser({
    customFields: {
      item: [
        ['content:encoded', 'contentEncoded'],
      ]
    }
  });

const SaveBlogs = async () => {

  const feed = await parser.parseURL('https://medium.com/feed/polarsquad');
  //console.log(feed.title);
  
  //console.log(process.env.REDIS_HOST);
  //console.log(process.env.REDIS_PORT);
  //console.log(process.env.REDIS_PWD);

  const blogAttrs = [];

  feed.items.forEach(async item => {
    const attrs = parseItem(item);
    blogAttrs.push(attrs);
  });

  console.log('Saving items..');
  await saveBlogs(blogAttrs);
};

const parseItem = (item): CreateBlogAttrs => {
  const imgSources = item.contentEncoded.match(/<img [^>]*src="[^"]*"[^>]*>/gm)
    .map(x => x.replace(/.*src="([^"]*)".*/, '$1'));
    const imageUrl = imgSources[0];

  return {
    title: item.title,
    author: item.creator,
    publishDate: item.pubDate,
    imageUrl: imageUrl,
    guidUrl: item.guid,
    tags: item.categories
  };
}

const job: nodeSchedule.Job = nodeSchedule.scheduleJob(process.env.CRON_JOB_SCHEDULE, async () => {
  try {
    console.log(`-- Scheduled job begins at ${DateTime.now().toISOTime()} --`);
    await SaveBlogs();
  } catch (error) {
    console.log("Error occured while saving the blogs - ", error);
  } finally {
    console.log(`-- Scheduled job ends at ${DateTime.now().toISOTime()} --`);
  }
});
