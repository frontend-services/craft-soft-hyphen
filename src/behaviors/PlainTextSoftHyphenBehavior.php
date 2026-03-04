<?php

namespace frontendservices\softhyphen\behaviors;

use yii\base\Behavior;

/**
 * Adds a softHyphenButtons setting to PlainText field instances.
 *
 * Attaching this behavior adds the $softHyphenButtons boolean property,
 * which is included in the field's saved settings via EVENT_DEFINE_SETTINGS_ATTRIBUTES.
 * The settings UI toggle is injected via EVENT_AFTER_RENDER_TEMPLATE in Plugin.php.
 */
class PlainTextSoftHyphenBehavior extends Behavior
{
    /**
     * Whether to show soft-hyphen / non-breaking-space insert buttons
     * next to the plain text input in the control panel.
     */
    public bool $softHyphenButtons = false;
}
