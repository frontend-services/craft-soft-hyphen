<?php

namespace frontendservices\softhyphen;

use Craft;
use craft\base\Plugin as BasePlugin;
use craft\ckeditor\Field;
use craft\ckeditor\Plugin as CkeditorPlugin;
use craft\htmlfield\events\ModifyPurifierConfigEvent;
use yii\base\Event;
use yii\web\Response;

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

        Event::on(
            Field::class,
            Field::EVENT_MODIFY_PURIFIER_CONFIG,
            function (ModifyPurifierConfigEvent $event) {
                $def = $event->config->getHTMLDefinition(true);
                if ($def) {
                    $def->addAttribute('span', 'class', 'Enum#fs-shy');
                }
            }
        );

        CkeditorPlugin::registerCkeditorPackage(
            assets\SoftHyphenAsset::class
        );

        // Replace <span class="fs-shy"> with ­ on frontend templates
        Event::on(
            \craft\web\View::class,
            \craft\web\View::EVENT_AFTER_RENDER_PAGE_TEMPLATE,
            function (\craft\events\TemplateEvent $event) {
                $event->output = preg_replace(
                    '/<span class="fs-shy">[^<]*<\/span>/',
                    "\u{00AD}",
                    $event->output
                );
            }
        );
    }
}