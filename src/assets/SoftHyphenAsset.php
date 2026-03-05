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
     * v5 uses ES modules + an import map; v4 uses the legacy window.CKEditor5 DLL globals.
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

    public function init(): void
    {
        if (self::isCkeditorV5()) {
            // ES module — resolved via the import map registered in Plugin::init()
            $this->js = [
                ['soft-hyphen-v5.js', 'type' => 'module'],
            ];
        } else {
            // Legacy IIFE — uses window.CKEditor5 globals provided by the DLL build
            $this->js = [
                'soft-hyphen.js',
            ];
        }

        parent::init();
    }
}