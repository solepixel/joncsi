<?php
/**
 * Joncsi Front Page
 *
 * @package   Briantics\Joncsi
 * @link      https://briantics.com/joncsi
 * @author    Briantics, Inc.
 * @copyright Copyright © 2018 Briantics, Inc.
 * @license   GPL-3.0-or-later
 */

namespace Briantics\Joncsi;

add_filter( 'the_content', __NAMESPACE__ . '\\front_page_content' );

function front_page_content( $content ) {
	$no_workout   = false;
	$content_view = get_stylesheet_directory() . '/resources/views/front-landing.php';

	if ( ! file_exists( $content_view ) ) {
		return $content;
	}

	$wod_query     = joncsi_query_wod();
	$workout_date  = current_time( 'Y-m-d' );
	$workout_title = __( 'Rest Day', 'joncsi' ) . ' - ' . current_time( 'n/j/Y' );

	if ( ! $wod_query ) {
		ob_start();
		$no_workout = true;
		include $content_view;
		return ob_get_clean();
	}

	if ( ! $wod_query->post_count ) {
		ob_start();
		$no_workout = true;
		include $content_view;
		return ob_get_clean();
	}

	while ( $wod_query->have_posts() ) :
		$wod_query->the_post();
		$workout_date  = get_the_date( 'Y-m-d' );
		$workout_title = get_the_title();
		$workout_id    = get_the_ID();

		ob_start();
		include $content_view;
		$content = ob_get_clean();
	endwhile;
	wp_reset_postdata();

	return $content;
}

// Run Genesis.
\genesis();
