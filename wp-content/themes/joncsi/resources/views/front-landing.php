<?php
/**
 * Front Page Landing View
 *
 * @package   Briantics\Joncsi
 * @link      https://briantics.com/joncsi
 * @author    Briantics, Inc.
 * @copyright Copyright © 2018 Briantics, Inc.
 * @license   GPL-3.0-or-later
 */

if ( ! function_exists( 'the_field' ) ) {
	return;
}

?>
<div class="app-wrap" data-workout-date="<?php echo esc_attr( $workout_date ); ?>" data-workout-id="<?php echo esc_attr( $workout_id ); ?>">
	<div class="loading">
		<div class="spinner"></div>
	</div>

	<div class="tab-container">
		<div class="workout-container tab-contents active" id="workouts">
			<?php if ( $no_workout ) : ?>
				<?php include get_stylesheet_directory() . '/resources/views/no-workout.php'; ?>
			<?php else : ?>
				<?php include get_stylesheet_directory() . '/resources/views/workouts.php'; ?>
			<?php endif; ?>
		</div>

		<div class="tools tab-contents" id="controls">
			<header>
				<img src="<?php echo esc_attr( get_stylesheet_directory_uri() ); ?>/resources/img/vomiting.png" class="logo-icon">
				<?php bloginfo( 'name' ); ?>
			</header>
			<div class="clock"></div>
			<div class="clock-controls">
				<button class="clock-clock" style="display: none;">Clock</button>
				<button class="clock-timer">Timer</button>
				<button class="clock-toggle">Start</button>
				<button class="clock-reset" style="display: none;">Reset</button>
				<button class="clock-mode secondary" style="display: none;" data-mode="up">Up</button>
			</div>

			<div class="workout-title">
				<?php joncsi_heart_icon( $workout_id ); ?>
				<?php echo $workout_title; ?>
			</div>

			<div class="percentage-matrix">
				<?php include get_stylesheet_directory() . '/resources/views/percentages.php'; ?>
			</div>

			<div class="workout-controls">
				<button class="prev-workout" rel="prev">Prev</button>
				<button class="today-workout" rel="today">WOD</button>
				<button class="next-workout" rel="next">Next</button>
			</div>
		</div>
	</div>
	<div class="bottom-tabs">
		<a href="#workouts" class="active">Workouts</a>
		<a href="#controls">Controls</a>
	</div>
</div>
