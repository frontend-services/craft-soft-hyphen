<?php

namespace frontendservices\softhyphen;

use Craft;
use craft\base\Plugin as BasePlugin;
use craft\ckeditor\Field;
use craft\ckeditor\Plugin as CkeditorPlugin;
use craft\htmlfield\events\ModifyPurifierConfigEvent;
use yii\base\Event;

class Plugin extends BasePlugin
{
    public string $schemaVersion = '1.0.0';

    public const EDITION_STANDARD = 'standard';

    /**
     * @inheritdoc
     */
    public static function editions(): array
    {
        return [
            self::EDITION_STANDARD,
        ];
    }

    public function init(): void
    {
        parent::init();

        // Allow <span class="fs-shy"> and <span class="fs-nbsp"> through the purifier
        Event::on(
            Field::class,
            Field::EVENT_MODIFY_PURIFIER_CONFIG,
            function (ModifyPurifierConfigEvent $event) {
                $def = $event->config->getHTMLDefinition(true);
                if ($def) {
                    $def->addAttribute('span', 'class', 'Enum#fs-shy,fs-nbsp');
                }
            }
        );

        // Register CKEditor package
        CkeditorPlugin::registerCkeditorPackage(
            assets\SoftHyphenAsset::class
        );

        // Replace spans with actual characters on frontend templates
        Event::on(
            \craft\web\View::class,
            \craft\web\View::EVENT_AFTER_RENDER_PAGE_TEMPLATE,
            function (\craft\events\TemplateEvent $event) {
                $event->output = preg_replace(
                    '/<span class="fs-shy">[^<]*<\/span>/',
                    "\u{00AD}",
                    $event->output
                );
                $event->output = preg_replace(
                    '/<span class="fs-nbsp">[^<]*<\/span>/',
                    "\u{00A0}",
                    $event->output
                );
            }
        );
    }
}