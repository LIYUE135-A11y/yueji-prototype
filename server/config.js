/**
 * 数据库与服务配置
 * 主机: localhost | 用户: root | 库: meilixiuxing
 */
module.exports = {
  port: Number(process.env.PORT || 3789),
  mysql: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '123456',
    database: process.env.DB_NAME || 'meilixiuxing',
    // Windows 默认安装路径；可用环境变量 MYSQL_BIN 覆盖
    bin:
      process.env.MYSQL_BIN ||
      'C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin\\mysql.exe'
  },
  // 与 common/db-bridge.js STORE_KEYS、运营管理模块对齐
  storeKeys: [
    'zhuangyan_product_list_v2',
    'zhuangyan_product_list_v1',
    'zhuangyan_merchant_list_v1',
    'zhuangyan_review_list_v1',
    'yueji_user_list_v2_feminine',
    'yueji_user_list_v3',
    'yueji_user_list_v4',
    'yueji_article_list_v2',
    'yueji_grass_list_v2',
    'yueji_topic_list_v2',
    'yueji_circle_list_v2',
    'yueji_feed_list_v2',
    'zhuangyan_activity_list_v2',
    'zhuangyan_activity_list_v1',
    'zhuangyan_claimed_coupons_v1',
    'zhuangyan_decor_entries_v1',
    'zhuangyan_decor_pages_v1',
    'zhuangyan_profile_orders_v1',
    'zhuangyan_profile_aftersales_v1',
    'zhuangyan_aftersale_list_v1',
    'zhuangyan_profile_cart_v1',
    'zhuangyan_order_list_v1',
    'zhuangyan_collect_list_v1',
    'zhuangyan_llm_settings_v1',
    'zhuangyan_llm_settings_v2',
    'zhuangyan_kb_list_v1',
    'zhuangyan_ai_help_articles_v1',
    'zhuangyan_ai_help_articles_seed_ver',
    'zhuangyan_ai_config_v1',
    'zhuangyan_kefu_sessions_v2',
    'zhuangyan_kefu_sessions_v1',
    'yueji_message_list_v1',
    'ai_guide_card_feedback_v2',
    'ai_guide_card_feedback_v1',
    'human_kefu_manage_v1'
  ]
};
