<?php

namespace frontendservices\softhyphen\assets;

use Composer\InstalledVersions;
use craft\ckeditor\web\assets\BaseCkeditorPackageAsset;

class SoftHyphenAsset extends BaseCkeditorPackageAsset
{
    public $sourcePath = __DIR__ . '/dist';

    public string $namespace = '@frontend-services/ckeditor5-soft-hyphen';

    public $css = [
        'soft-hyphen.css',
    ];

    public array $pluginNames = [
        'SoftHyphen',
        'NonBreakingSpace',
    ];

    public array $toolbarItems = [
        'softHyphen',
        'nonBreakingSpace',
    ];

    /**
     * Returns true when the installed craftcms/ckeditor package is v5 or newer.
     */
    public static function isCkeditorV5(): bool
    {
        try {
            $version = InstalledVersions::getVersion('craftcms/ckeditor');
            return $version !== null && version_compare($version, '5.0.0', '>=');
        } catch (\OutOfBoundsException $e) {
            return false;
        }
    }

    /**
     * Guard registerPackage() so it only calls CkeditorConfig::registerPackage()
     * once per request, no matter how many CKEditor fields are on the page.
     *
     * CKEditor's EVENT_AFTER_REGISTER_ASSET_BUNDLE fires every time
     * registerAssetBundle() is called (even for already-registered bundles),
     * so without this guard the plugins accumulate in the static array and
     * produce a broken import statement with duplicate identifiers:
     *   import { SoftHyphen, NonBreakingSpace, SoftHyphen, NonBreakingSpace } from "..."
     */
    public function registerPackage(): void
    {
        static $registered = false;
        if ($registered) {
            return;
        }
        $registered = true;
        parent::registerPackage();
    }

    public function init(): void
    {
        if (self::isCkeditorV5()) {
            // Do NOT add to $js — the file is loaded exclusively via the import map
            // entry registered in Plugin.php. Adding it here too would cause the
            // browser to execute it twice, throwing "already declared" errors.
            $this->js = [];
        } else {
            // Legacy IIFE — uses window.CKEditor5 globals provided by the DLL build
            $this->js = [
                'soft-hyphen.js',
            ];
        }

        parent::init();
    }
}

