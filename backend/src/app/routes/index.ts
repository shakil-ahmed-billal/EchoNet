import { Router } from 'express';

import { UserRoutes } from '../module/user/user.route.js';
import { AuthRoutes } from '../module/auth/auth.route.js';
import { PostRoutes } from '../module/post/post.route.js';
import { CommentRoutes } from '../module/comment/comment.route.js';
import { LikeRoutes } from '../module/like/like.route.js';
import { FollowRoutes } from '../module/follow/follow.route.js';
import { MessageRoutes } from '../module/message/message.route.js';
import { AnnouncementRoutes } from '../module/announcement/announcement.route.js';
import { NotificationRoutes } from '../module/notification/notification.route.js';
import { UploadRoutes } from '../module/upload/upload.route.js';
import { StoryRoutes } from '../module/story/story.route.js';

const router = Router();

const moduleRoutes: { path: string; route: Router }[] = [
  {
    path: '/users',
    route: UserRoutes,
  },
  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path: '/posts',
    route: PostRoutes,
  },
  {
    path: '/comments',
    route: CommentRoutes,
  },
  {
    path: '/likes',
    route: LikeRoutes,
  },
  {
    path: '/messages',
    route: MessageRoutes,
  },
  {
    path: '/announcements',
    route: AnnouncementRoutes,
  },
  {
    path: '/notifications',
    route: NotificationRoutes,
  },
  {
    path: '/upload',
    route: UploadRoutes,
  },
  {
    path: '/stories',
    route: StoryRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
