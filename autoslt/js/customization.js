// ************************************************************************
// * File Name: customization.js
// * Description: Define special values which ODM can customize
// * Note:
// ************************************************************************

'use strict';

// naming rule: {{test item}}_{{function description}}_{{sub description}}

/* Vibrate example: VIBRATE_DURATION  VIBRATE_REST  VIBRATE_TIMES
 *                        1500             0              0           always vibrate unless pass/fail pressed
 *                        1500           1000             5           total vibrate 5 times every 2500ms, each duration
 *                                                                    1500ms.
 * /

/*
 * Vibrate duration time
 * value type: number(ms)
 * note: Once vibrate duration time.
 */
const VIBRATE_DURATION = 1500;

/*
 * Vibrate rest time
 * value type: number(ms)
 * note: Time between two vibrate operate, mean rest.
 */

const VIBRATE_REST = 0;

/*
 * Vibrate times
 * value type: 1 <= number
 * note: Total times vibrate;
 *       Only when we want vibrate always unless user press pass/fail, it can be 0.
 */
const VIBRATE_TIMES = 0;
