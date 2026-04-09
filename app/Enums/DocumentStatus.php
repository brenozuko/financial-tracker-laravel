<?php

namespace App\Enums;

enum DocumentStatus: string
{
    case Queued = 'queued';
    case Processing = 'processing';
    case Done = 'done';
    case Failed = 'failed';
}
