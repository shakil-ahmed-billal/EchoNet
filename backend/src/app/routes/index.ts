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
import { SearchRoutes } from '../module/search/search.route.js';
import { HashtagRoutes } from '../module/hashtag/hashtag.route.js';
import { SavedPostRoutes } from '../module/savedPost/savedPost.route.js';
import { ReactionRoutes } from '../module/reaction/reaction.route.js';
import { GroupRoutes } from '../module/group/group.route.js';
import { StoreRoutes } from '../module/store/store.route.js';
import { ProductRoutes } from '../module/product/product.route.js';
import { CategoryRoutes } from '../module/category/category.route.js';
import { OrderRoutes } from '../module/order/order.route.js';
import { PaymentRoutes } from '../module/payment/payment.route.js';
import { PropertyRoutes } from '../module/property/property.route.js';
import { BookingRoutes } from '../module/booking/booking.route.js';
import { EnquiryRoutes } from '../module/enquiry/enquiry.route.js';
import { AgentRoutes } from '../module/agent/agent.route.js';
import { AdminRoutes } from '../module/admin/admin.route.js';
import { SettingRoutes } from '../module/setting/setting.route.js';

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
  {
    path: '/follow',
    route: FollowRoutes,
  },
  {
    path: '/search',
    route: SearchRoutes,
  },
  {
    path: '/hashtags',
    route: HashtagRoutes,
  },
  {
    path: '/saved-posts',
    route: SavedPostRoutes,
  },
  {
    path: '/reactions',
    route: ReactionRoutes,
  },
  {
    path: '/groups',
    route: GroupRoutes,
  },
  {
    path: '/stores',
    route: StoreRoutes,
  },
  {
    path: '/products',
    route: ProductRoutes,
  },
  {
    path: '/categories',
    route: CategoryRoutes,
  },
  {
    path: '/orders',
    route: OrderRoutes,
  },
  {
    path: '/payments',
    route: PaymentRoutes,
  },
  {
    path: '/properties',
    route: PropertyRoutes,
  },
  {
    path: '/bookings',
    route: BookingRoutes,
  },
  {
    path: '/enquiries',
    route: EnquiryRoutes,
  },
  {
    path: '/agents',
    route: AgentRoutes,
  },
  {
    path: '/admin',
    route: AdminRoutes,
  },
  {
    path: '/settings',
    route: SettingRoutes,
  },
];

moduleRoutes.forEach((route) => {
    router.use(route.path, route.route);
});

export default router;
