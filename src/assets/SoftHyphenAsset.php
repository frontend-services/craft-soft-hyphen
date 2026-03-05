<?php

namespace frontendservices\softhyphen\assets;

use craft\ckeditor\web\assets\BaseCkeditorPackageAsset;

class SoftHyphenAsset extends BaseCkeditorPackageAsset
{
    public $sourcePath = __DIR__ . '/dist';

    public string $namespace = '@frontend-services/ckeditor5-soft-hyphen';

    public $js = [
        'soft-hyphen.js',
    ];

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
}