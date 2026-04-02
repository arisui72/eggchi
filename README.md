# Eggchi

カラフルでポップな世界観の、1画面完結型バーチャルペット育成 Web アプリです。

## ファイル

- [最新仕様書](./SPEC.md)
- [アプリ本体](./index.html)
- [PWA マニフェスト](./manifest.webmanifest)
- [Service Worker](./sw.js)

## 概要

- 単一ファイル中心で動く育成ゲーム
- セーブデータは LocalStorage に保存
- PWA 対応
- Service Worker によるオフライン起動補助あり
- ミニゲーム、進化分岐、図鑑、世代交代を実装

## 開発メモ

- 現在の仕様確認は [SPEC.md](./SPEC.md) を参照してください。
- 公開運用は GitHub Pages などの HTTPS ホスティングを前提としています。
