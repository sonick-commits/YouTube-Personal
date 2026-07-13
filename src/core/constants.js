/**
 * ============================================================
 * YouTube Personal
 * File    : constants.js
 * Version : 0.1.0
 *
 * プロジェクト全体で使用する共通定数。
 * UIセレクタやイベント名は別ファイルで管理する。
 * ============================================================
 */

'use strict';

/**
 * プロジェクト情報
 */
export const APP = Object.freeze({
    NAME: 'YouTube Personal',
    VERSION: '0.1.0',
    NAMESPACE: 'youtube-personal'
});

/**
 * 開発モード
 *
 * true:
 *  ・Loggerを有効化
 *  ・開発用ログを表示
 *
 * false:
 *  ・リリースモード
 */
export const DEBUG = true;

/**
 * Tampermonkey Storage Prefix
 *
 * 将来キーが増えても管理しやすいように
 * プレフィックスを統一する。
 */
export const STORAGE_PREFIX = 'yt-personal';

/**
 * アプリケーション初期化状態
 */
export const APP_STATE = Object.freeze({
    BOOTING: 'booting',
    READY: 'ready',
    DESTROYED: 'destroyed'
});

/**
 * モジュール名
 *
 * register()時の識別子として使用する。
 */
export const MODULE = Object.freeze({
    LAYOUT: 'layout',
    PLAYER: 'player',
    LIVE: 'live',
    TABS: 'tabs',
    SETTINGS: 'settings'
});

/**
 * デフォルト設定バージョン
 *
 * 設定構造が変更された場合、
 * 将来的にマイグレーション判定に使用する。
 */
export const SETTINGS_VERSION = 1;

/**
 * 設定保存キー
 */
export const STORAGE_KEY = Object.freeze({
    SETTINGS: `${STORAGE_PREFIX}:settings`
});
