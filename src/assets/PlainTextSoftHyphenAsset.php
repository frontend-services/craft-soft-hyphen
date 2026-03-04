<?php

namespace frontendservices\softhyphen\assets;

use craft\web\AssetBundle;
use craft\web\assets\cp\CpAsset;

class PlainTextSoftHyphenAsset extends AssetBundle
{
    public $sourcePath = __DIR__ . '/dist';

    public $depends = [
        CpAsset::class,
    ];

    public $js = [
        'plain-text-soft-hyphen.js',
    ];

    public $css = [
        'plain-text-soft-hyphen.css',
    ];
}

