<?php

namespace frontendservices\softhyphen\models;

use craft\base\Model;

class Settings extends Model
{
    /**
     * Whether to show soft-hyphen / non-breaking-space insert buttons
     * next to the title field in the control panel.
     */
    public bool $titleFieldButtons = false;
}

