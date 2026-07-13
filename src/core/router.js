/**
 * ============================================================
 * YouTube Personal
 * File    : router.js
 * Version : 0.1.0
 *
 * YouTubeのSPA（シングルページアプリケーション）におけるURL遷移を監視し、
 * ページの種類（ホーム、動画視聴、Shortsなど）を判定して通知するルータークラス。
 * 
 * 責務
 * ・URLの変化を定常的に監視（popstateおよびyt-navigate-finishによる軽量検知）
 * ・現在のURLに基づいたルート（ページ種別）の判定
 * ・URL変化時に登録されたコールバック関数への通知（オブザーバーパターン）
 * ============================================================
 */
'use strict';

import { Logger } from './logger.js';

/**
 * ルータークラス
 */
export class Router {
    /** @type {Set<function(string, URL): void>} */
    #listeners;

    /** @type {string} */
    #lastUrl;

    /** @type {boolean} */
    #isTracking;

    /**
     * コンストラクタ
     */
    constructor() {
        this.#listeners = new Set();
        this.#lastUrl = location.href;
        this.#isTracking = false;
        Logger.info('Router initialized');
    }

    /**
     * URLの監視を開始する
     */
    start() {
        if (this.#isTracking) {
            Logger.warn('Router: Tracking has already started.');
            return;
        }

        // 1. 履歴操作（ブラウザの戻る・進むボタンなど）によるURL変化を監視
        window.addEventListener('popstate', this.#handleLocationChange);

        // 2. YouTube固有のSPA遷移完了イベントを監視（MutationObserverより圧倒的に軽量）
        window.addEventListener('yt-navigate-finish', this.#handleLocationChange);

        this.#isTracking = true;
        Logger.info('Router: URL tracking started (Event-driven mode).');
    }

    /**
     * URLの監視を停止し、リソースを解放する（クリーンアップ用）
     */
    stop() {
        window.removeEventListener('popstate', this.#handleLocationChange);
        window.removeEventListener('yt-navigate-finish', this.#handleLocationChange);

        this.#isTracking = false;
        Logger.info('Router: URL tracking stopped.');
    }

    /**
     * ルート変更時に実行するコールバック関数を登録する
     * 
     * @param {function(string, URL): void} callback - (routeType, urlObject) を受け取る関数
     */
    onRouteChange(callback) {
        if (typeof callback === 'function') {
            this.#listeners.add(callback);
        }
    }

    /**
     * 登録済みのコールバック関数を解除する
     * 
     * @param {function(string, URL): void} callback - 解除する関数
     */
    offRouteChange(callback) {
        this.#listeners.delete(callback);
    }

    /**
     * 現在のURLに基づき、ページの種別（ルート）を判定する
     * 
     * @param {URL} urlObj - 判定対象のURLオブジェクト（デフォルトは現在のlocation）
     * @returns {string} 判定されたルート識別子（'watch' | 'shorts' | 'home' | 'unknown'）
     */
    getRouteType(urlObj = new URL(location.href)) {
        const path = urlObj.pathname;

        if (path === '/watch') {
            return 'watch';
        }
        if (path.startsWith('/shorts/')) {
            return 'shorts';
        }
        if (path === '/' || path === '/index') {
            return 'home';
        }
        
        return 'unknown';
    }

    /**
     * URLの変化を検知した際のハンドラ（矢印関数でコンテキストを固定）
     */
    #handleLocationChange = () => {
        const currentUrl = location.href;

        // URLに変化がなければ何もしない（無駄な通知の完全フィルタリング）
        if (currentUrl === this.#lastUrl) {
            return;
        }

        this.#lastUrl = currentUrl;
        
        try {
            const urlObj = new URL(currentUrl);
            const routeType = this.getRouteType(urlObj);

            Logger.info(`Router: Route changed to "${routeType}" (${urlObj.pathname})`);

            // 登録されたすべてのリスナーに通知
            for (const listener of this.#listeners) {
                try {
                    listener(routeType, urlObj);
                } catch (listenerError) {
                    Logger.error('Router: Error in route listener callback:', listenerError);
                }
            }
        } catch (error) {
            Logger.error('Router: Error during handling location change:', error);
        }
    };
}
