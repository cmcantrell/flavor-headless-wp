<?php
/**
 * This theme intentionally renders nothing.
 * All frontend rendering is handled by the headless Next.js app.
 */

wp_redirect( admin_url() );
exit;
