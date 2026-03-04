<?php

namespace frontendservices\softhyphen;

use Craft;
use craft\base\Element;
use craft\base\Field as BaseField;
use craft\base\Model;
use craft\base\Plugin as BasePlugin;
use craft\ckeditor\Field;
use craft\ckeditor\Plugin as CkeditorPlugin;
use craft\events\DefineFieldHtmlEvent;
use craft\events\DefineBehaviorsEvent;
use craft\events\DefineValueEvent;
use craft\events\FieldElementEvent;
use craft\events\TemplateEvent;
use craft\fields\PlainText;
use craft\htmlfield\events\ModifyPurifierConfigEvent;
use craft\web\View;
use frontendservices\softhyphen\assets\PlainTextSoftHyphenAsset;
use frontendservices\softhyphen\behaviors\PlainTextSoftHyphenBehavior;
use frontendservices\softhyphen\models\Settings;
use yii\base\Event;
use yii\base\ModelEvent;

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

    public bool $hasCpSettings = true;

    protected function createSettingsModel(): ?Model
    {
        return new Settings();
    }

    protected function settingsHtml(): ?string
    {
        return Craft::$app->getView()->renderTemplate(
            'soft-hyphen/settings.twig',
            ['settings' => $this->getSettings()],
            View::TEMPLATE_MODE_CP
        );
    }

    public function init(): void
    {
        parent::init();

        // ── Title field integration ───────────────────────────────────────────

        // 6. Wrap the title input HTML with the button bar when the setting is on.
        Event::on(
            View::class,
            View::EVENT_AFTER_RENDER_TEMPLATE,
            function (TemplateEvent $event) {
                if ($event->template !== '_includes/forms/text.twig' && $event->template !== '_includes/forms/text') {
                    return;
                }

                /** @var Settings $settings */
                $settings = $this->getSettings();
                if (!$settings->titleFieldButtons) {
                    return;
                }

                // Only target the title input — TitleField passes name="title"
                // (from $this->name ?? $this->attribute(), which is 'title').
                // The 'title' variable is the HTML tooltip attr (null), so check 'name'.
                if (($event->variables['name'] ?? null) !== 'title') {
                    return;
                }

                $view = Craft::$app->getView();
                $view->registerAssetBundle(PlainTextSoftHyphenAsset::class);

                $inputId = $view->namespaceInputId('title');

                // Replace invisible chars with visible proxies for display
                $inputHtml = str_replace(
                    ["\u{00AD}", "\u{00A0}"],
                    ["\u{00B7}", "\u{2423}"],
                    $event->output
                );

                $event->output =
                    '<div class="fs-plain-shy-wrap" data-input-id="' . $inputId . '">' .
                    $inputHtml .
                    '<div class="fs-plain-shy-buttons"></div>' .
                    '</div>';
            }
        );

        // 7. Before the element is saved, decode proxy chars in the title.
        Event::on(
            Element::class,
            Element::EVENT_BEFORE_SAVE,
            function (ModelEvent $event) {
                /** @var Settings $settings */
                $settings = $this->getSettings();
                if (!$settings->titleFieldButtons) {
                    return;
                }

                /** @var Element $element */
                $element = $event->sender;

                if (!isset($element->title) || !is_string($element->title)) {
                    return;
                }

                $decoded = str_replace(
                    ["\u{00B7}", "\u{2423}"],
                    ["\u{00AD}", "\u{00A0}"],
                    $element->title
                );

                if ($decoded !== $element->title) {
                    $element->title = $decoded;
                }
            }
        );

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
            View::class,
            View::EVENT_AFTER_RENDER_PAGE_TEMPLATE,
            function (TemplateEvent $event) {
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

        // ── Plain Text field integration ─────────────────────────────────────

        // 1. Attach behavior to every PlainText field instance so it gains
        //    the $softHyphenButtons property (used for settings persistence).
        Event::on(
            PlainText::class,
            Model::EVENT_DEFINE_BEHAVIORS,
            function (DefineBehaviorsEvent $event) {
                $event->behaviors['softHyphen'] = PlainTextSoftHyphenBehavior::class;
            }
        );

        // 2. Include softHyphenButtons in the field's saved settings array.
        Event::on(
            PlainText::class,
            PlainText::EVENT_DEFINE_SETTINGS_ATTRIBUTES,
            function (DefineValueEvent $event) {
                $event->value[] = 'softHyphenButtons';
            }
        );

        // 3. Append our lightswitch to the PlainText field settings panel.
        //    Two render paths exist:
        //    a) Page load: _edit.twig includes _type-settings.twig; `field` is
        //       inherited Twig scope, NOT in TemplateEvent::$variables for the
        //       sub-template, so we capture it from the parent render.
        //    b) AJAX (field-type switch): actionRenderSettings() calls
        //       renderTemplate('settings/fields/_type-settings.twig', ['field'=>...])
        //       directly, so `field` IS in TemplateEvent::$variables.
        $capturedField = null;
        $typeSettingsTemplates = [
            'settings/fields/_type-settings',
            'settings/fields/_type-settings.twig',
            '_components/fieldtypes/PlainText/settings.twig'
        ];

        Event::on(
            View::class,
            View::EVENT_BEFORE_RENDER_TEMPLATE,
            function (TemplateEvent $event) use (&$capturedField, $typeSettingsTemplates) {
                // Capture from parent template (page-load path)
                if ($event->template === 'settings/fields/_edit') {
                    $field = $event->variables['field'] ?? null;
                    $capturedField = ($field instanceof PlainText) ? $field : null;
                }
                // Also capture directly when rendered standalone (AJAX path)
                if (in_array($event->template, $typeSettingsTemplates, true)) {
                    $field = $event->variables['field'] ?? null;
                    if ($field instanceof PlainText) {
                        $capturedField = $field;
                    }
                }
            }
        );

        Event::on(
            View::class,
            View::EVENT_AFTER_RENDER_TEMPLATE,
            function (TemplateEvent $event) use (&$capturedField, $typeSettingsTemplates) {
                if (!in_array($event->template, $typeSettingsTemplates, true)) {
                    return;
                }

                $field = $capturedField;
                $capturedField = null;

                if (!($field instanceof PlainText)) {
                    return;
                }

                $view = Craft::$app->getView();
                $namespace = $event->variables['namespace'] ?? null;

                $extraHtml = $view->namespaceInputs(
                    fn() => $view->renderTemplate(
                        'soft-hyphen/plain-text/settings.twig',
                        ['field' => $field],
                        View::TEMPLATE_MODE_CP
                    ),
                    $namespace
                );

                $event->output .= $extraHtml;
            }
        );

        // 4. Before the element is saved, swap the visible proxy characters back
        //    to the real invisible ones so the database stores the correct values.
        //    · (\u00B7) → soft hyphen (\u00AD)
        //    ␣ (\u2423) → NBSP        (\u00A0)
        Event::on(
            PlainText::class,
            BaseField::EVENT_BEFORE_ELEMENT_SAVE,
            function (FieldElementEvent $event) {
                /** @var PlainText $field */
                $field = $event->sender;

                if (empty($field->softHyphenButtons)) {
                    return;
                }

                $element = $event->element;
                $value = $element->getFieldValue($field->handle);

                if (!is_string($value)) {
                    return;
                }

                $decoded = str_replace(
                    ["\u{00B7}", "\u{2423}"],
                    ["\u{00AD}", "\u{00A0}"],
                    $value
                );

                if ($decoded !== $value) {
                    $element->setFieldValue($field->handle, $decoded);
                }
            }
        );

        // 5. Wrap the input HTML with the button bar when the setting is on.
        Event::on(
            PlainText::class,
            BaseField::EVENT_DEFINE_INPUT_HTML,
            function (DefineFieldHtmlEvent $event) {
                /** @var PlainText $field */
                $field = $event->sender;

                if (empty($field->softHyphenButtons)) {
                    return;
                }

                // Register the asset bundle once per request
                Craft::$app->getView()->registerAssetBundle(PlainTextSoftHyphenAsset::class);

                $inputId = Craft::$app->getView()->namespaceInputId($field->getInputId());

                // Replace invisible chars with their visible proxies in the rendered HTML
                // so the editor sees · and ␣ instead of blank-looking characters.
                $inputHtml = str_replace(
                    ["\u{00AD}", "\u{00A0}"],
                    ["\u{00B7}", "\u{2423}"],
                    $event->html
                );

                $event->html =
                    '<div class="fs-plain-shy-wrap" data-input-id="' . $inputId . '">' .
                    $inputHtml .
                    '<div class="fs-plain-shy-buttons"></div>' .
                    '</div>';
            }
        );
    }
}
