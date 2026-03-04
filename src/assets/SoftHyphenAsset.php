<?php

namespace frontendservices\softhyphen\assets;

use craft\ckeditor\web\assets\BaseCkeditorPackageAsset;

class SoftHyphenAsset extends BaseCkeditorPackageAsset
{
    public $sourcePath = __DIR__ . '/dist';

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