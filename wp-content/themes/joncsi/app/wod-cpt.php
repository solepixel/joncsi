<?php
/**
 * WOD Custom Post Type
 *
 * @package   Briantics\Joncsi
 * @link      https://briantics.com/joncsi
 * @author    Briantics, Inc.
 * @copyright Copyright © 2018 Briantics, Inc.
 * @license   GPL-3.0-or-later
 */

if ( ! function_exists( 'joncsi_wod' ) ) {

	// Register Custom Post Type
	function joncsi_wod() {

		$labels  = array(
			'name'                  => _x( 'WODs', 'Post Type General Name', 'joncsi' ),
			'singular_name'         => _x( 'WOD', 'Post Type Singular Name', 'joncsi' ),
			'menu_name'             => __( 'Workouts', 'joncsi' ),
			'name_admin_bar'        => __( 'Workout', 'joncsi' ),
			'archives'              => __( 'Workout Archives', 'joncsi' ),
			'attributes'            => __( 'Workout Attributes', 'joncsi' ),
			'parent_item_colon'     => __( 'Parent Workout:', 'joncsi' ),
			'all_items'             => __( 'All Workouts', 'joncsi' ),
			'add_new_item'          => __( 'Add New Workout', 'joncsi' ),
			'add_new'               => __( 'Add New', 'joncsi' ),
			'new_item'              => __( 'New Workout', 'joncsi' ),
			'edit_item'             => __( 'Edit Workout', 'joncsi' ),
			'update_item'           => __( 'Update Workout', 'joncsi' ),
			'view_item'             => __( 'View Workout', 'joncsi' ),
			'view_items'            => __( 'View Workouts', 'joncsi' ),
			'search_items'          => __( 'Search Workout', 'joncsi' ),
			'not_found'             => __( 'Not found', 'joncsi' ),
			'not_found_in_trash'    => __( 'Not found in Trash', 'joncsi' ),
			'featured_image'        => __( 'Featured Image', 'joncsi' ),
			'set_featured_image'    => __( 'Set featured image', 'joncsi' ),
			'remove_featured_image' => __( 'Remove featured image', 'joncsi' ),
			'use_featured_image'    => __( 'Use as featured image', 'joncsi' ),
			'insert_into_item'      => __( 'Insert into workout', 'joncsi' ),
			'uploaded_to_this_item' => __( 'Uploaded to this workout', 'joncsi' ),
			'items_list'            => __( 'WOD list', 'joncsi' ),
			'items_list_navigation' => __( 'WOD list navigation', 'joncsi' ),
			'filter_items_list'     => __( 'Filter workouts list', 'joncsi' ),
		);
		$rewrite = array(
			'slug'       => 'wod',
			'with_front' => false,
			'pages'      => true,
			'feeds'      => true,
		);
		$args    = array(
			'label'                 => __( 'WOD', 'joncsi' ),
			'description'           => __( 'Workout of the Day', 'joncsi' ),
			'labels'                => $labels,
			'supports'              => array( 'title', 'thumbnail', 'revisions' ),
			'hierarchical'          => false,
			'public'                => true,
			'show_ui'               => true,
			'show_in_menu'          => true,
			'menu_position'         => 5,
			'menu_icon'             => get_stylesheet_directory_uri() . '/resources/img/vomiting.png',
			'show_in_admin_bar'     => true,
			'show_in_nav_menus'     => true,
			'can_export'            => true,
			'has_archive'           => 'workouts',
			'exclude_from_search'   => false,
			'publicly_queryable'    => true,
			'rewrite'               => $rewrite,
			'capability_type'       => 'page',
			'show_in_rest'          => true,
			'rest_base'             => 'wod',
			'rest_controller_class' => 'WP_REST_WOD_Controller',
		);
		register_post_type( 'joncsi-wod', $args );

	}
	add_action( 'init', 'joncsi_wod', 0 );

}

function joncsi_get_adjacent_workout( $relative = 'after' ) {
	$response = array(
		'success' => false,
	);

	$date = isset( $_GET['date'] ) ? sanitize_text_field( $_GET['date'] ) : false;

	if ( $date ) {

		$wod_query = joncsi_query_wod( $relative, $date );

		if ( $wod_query && $wod_query->post_count ) {
			while ( $wod_query->have_posts() ) :
				$wod_query->the_post();

				$response['success']       = true;
				$response['workout_date']  = get_the_date( 'Y-m-d' );
				$response['workout_title'] = joncsi_heart_icon( get_the_ID(), false ) . get_the_title();
				$response['workout_id']    = get_the_ID();

				ob_start();
				include get_stylesheet_directory() . '/resources/views/workouts.php';
				$response['workouts'] = ob_get_clean();

			endwhile;
			wp_reset_postdata();
		} else {
			ob_start();
			include get_stylesheet_directory() . '/resources/views/no-workout.php';
			$response['workouts']      = ob_get_clean();
			$response['success']       = true;
			$response['workout_date']  = current_time( 'Y-m-d' );
			$response['workout_title'] = __( 'Rest Day', 'joncsi' ) . ' - ' . current_time( 'n/j/Y' );
		}
	}

	wp_send_json( $response );
	exit();
}

function joncsi_get_next_workout() {
	joncsi_get_adjacent_workout();
}

function joncsi_get_prev_workout() {
	joncsi_get_adjacent_workout( 'before' );
}

function joncsi_get_today_workout() {
	$response = array(
		'success' => false,
	);

	$wod_query = joncsi_query_wod( 'today' );

	if ( $wod_query && $wod_query->post_count ) {
		while ( $wod_query->have_posts() ) :
			$wod_query->the_post();

			$response['workout_date']  = get_the_date( 'Y-m-d' );
			$response['workout_title'] = joncsi_heart_icon( get_the_ID(), false ) . get_the_title();
			$response['workout_id']    = get_the_ID();
			$response['success']       = true;

			ob_start();
			include get_stylesheet_directory() . '/resources/views/workouts.php';
			$response['workouts'] = ob_get_clean();
		endwhile;
		wp_reset_postdata();
	} else {
		ob_start();
		include get_stylesheet_directory() . '/resources/views/no-workout.php';
		$response['workouts']      = ob_get_clean();
		$response['success']       = true;
		$response['workout_date']  = current_time( 'Y-m-d' );
		$response['workout_title'] = __( 'Rest Day', 'joncsi' ) . ' - ' . current_time( 'n/j/Y' );
	}

	wp_send_json( $response );
	exit();
}

function joncsi_query_wod( $query = 'today', $relative_date = '' ) {
	$wod_query = false;

	if ( 'today' === $query ) {
		$wod_query = new \WP_Query( array(
			'post_type'      => 'joncsi-wod',
			'posts_per_page' => 1,
			'post_status'    => array( 'publish', 'pending', 'future' ),
			'date_query'     => array(
				'year'  => current_time( 'Y' ),
				'month' => current_time( 'm' ),
				'day'   => current_time( 'd' ),
			),
		) );

		if ( ! $wod_query || ! $wod_query->post_count ) {
			return joncsi_query_wod( 'next', current_time( 'mysql' ) );
		}
	} else {
		$siblings = joncsi_get_wod_siblings( $relative_date );
		$key      = 'before' === $query ? 'prev' : 'next';
		if ( count( $siblings[ $key ] ) ) {
			$wod_query = new \WP_Query( array(
				'post_type'      => 'joncsi-wod',
				'posts_per_page' => 1,
				'post_status'    => array( 'publish', 'pending', 'future' ),
				'post__in'       => $siblings[ $key ],
			) );
		}
	}

	return $wod_query;
}

function joncsi_get_wod_siblings( $date = '', $limit = 1 ) {
	global $wpdb;

	if ( empty( $date ) ) {
		$date = current_time( 'mysql' );
	}

	$limit = absint( $limit );
	if ( ! $limit ) {
		return;
	}

	$post_type   = 'joncsi-wod';
	$post_status = '( \'' . implode( '\',\'', array( 'publish', 'future', 'pending' ) ) . '\' )';

	$query = "
	(
		SELECT
			p1.post_date,
			p1.ID
		FROM
			$wpdb->posts p1
		WHERE
			p1.post_date < '$date 00:00:00' AND
			p1.post_type = '$post_type' AND
			p1.post_status IN $post_status
		ORDER by
			p1.post_date DESC
		LIMIT
			$limit
	)
	UNION
	(
		SELECT
			p2.post_date,
			p2.ID
		FROM
			$wpdb->posts p2
		WHERE
			p2.post_date > '$date 23:59:59' AND
			p2.post_type = '$post_type' AND
			p2.post_status IN $post_status
		ORDER by
			p2.post_date ASC
		LIMIT
			$limit
	)
	ORDER by post_date ASC";

	$p = $wpdb->get_results( $query );

	$i         = 0;
	$total     = count( $p );
	$adjacents = array(
		'next' => array(),
		'prev' => array(),
	);

	for ( $c = $total; $i < $c; $i++ ) {
		if ( $p[ $i ]->post_date < $date ) {
			$adjacents['prev'][] = $p[ $i ]->ID;
		} else {
			$adjacents['next'][] = $p[ $i ]->ID;
		}
	}

	return $adjacents;
}

function joncsi_wod_content( $content ) {
	if ( is_front_page() ) {
		return $content;
	}

	$workout_title = get_the_title();
	ob_start();
	include get_stylesheet_directory() . '/resources/views/workouts.php';
	$content = ob_get_clean();

	return $content;
}

function joncsi_like_workout() {
	$response = array(
		'success' => false,
	);

	$workout_id = isset( $_POST['workout_id'] ) ? (int) sanitize_text_field( $_POST['workout_id'] ) : false;

	if ( ! $workout_id ) {
		wp_send_json( $response, 400 );
		exit();
	}

	$likes = get_post_meta( $workout_id, '_joncsi_likes', true );
	if ( ! $likes ) {
		$likes = 0;
	}
	$cookie = isset( $_COOKIE['joncsi_likes'] ) ? json_decode( $_COOKIE['joncsi_likes'] ) : array();
	if ( in_array( $workout_id, $cookie ) ) {
		$response['liked'] = false;
		$array_key         = array_search( $workout_id, $cookie );
		if ( false !== $array_key ) {
			unset( $cookie[ $array_key ] );
		}
		if ( $likes > 0 ) {
			$likes--;
		}
	} else {
		$response['liked'] = true;
		$cookie[]          = $workout_id;
		$likes++;
	}

	setcookie( 'joncsi_likes', json_encode( $cookie ), current_time( 'timestamp' ) + YEAR_IN_SECONDS, '/' );
	update_post_meta( $workout_id, '_joncsi_likes', $likes );

	$response['likes_count'] = $likes;
	$response['success']     = true;

	wp_send_json( $response );
	exit();
}

function joncsi_workout_is_liked( $workout_id = null ) {
	if ( is_null( $workout_id ) ) {
		$workout_id = get_the_ID();
	}
	$cookie = isset( $_COOKIE['joncsi_likes'] ) ? json_decode( $_COOKIE['joncsi_likes'] ) : array();
	if ( in_array( $workout_id, $cookie ) ) {
		return true;
	}
	return false;
}

function joncsi_heart_icon( $workout_id = null, $echo = true ) {
	if ( is_null( $workout_id ) ) {
		$workout_id = get_the_ID();
	}
	$liked  = joncsi_workout_is_liked( $workout_id );
	$class  = $liked ? 'filled' : 'outline';
	$output = sprintf( '<i class="heart-icon %s"></i>', $class );

	if ( ! $echo ) {
		return $output;
	}

	echo $output;
}
