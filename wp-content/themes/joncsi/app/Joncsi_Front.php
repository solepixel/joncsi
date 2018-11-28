<?php
/**
 * Example of how to create a custom component which accepts a config.
 *
 * @package   Briantics\Joncsi
 * @link      https://briantics.com/joncsi
 * @author    Briantics, Inc.
 * @copyright Copyright © 2018 Briantics, Inc.
 * @license   GPL-3.0-or-later
 */

namespace Briantics\Joncsi;

use SeoThemes\Core\Component;

/**
 * Example of how to create a custom component.
 *
 * Example config (usually located at config/defaults.php):
 *
 * ```
 * $core_example = [
 *     Example::SUB_CONFIG => [
 *         Example::KEY => 'value',
 *     ],
 * ];
 *
 * return [
 *     Example::class => $core_example,
 * ];
 * ```
 */
class Joncsi_Front extends Component {

	const SUB_CONFIG = 'joncsi-admin';
	const KEY = 'joncsi';

	/**
	 * Initialize class.
	 *
	 * @since 3.3.0
	 *
	 * @return void
	 */
	public function init() {
		if ( array_key_exists( self::SUB_CONFIG, $this->config ) ) {
			//$this->test( $this->config[ self::SUB_CONFIG ] );
		}

	}

	/**
	 * Example method.
	 *
	 * @since 3.3.0
	 *
	 * @param array $config Components sub config.
	 *
	 * @return void
	 */
	public function test( $content ) {

	}
}
