<?php
/**
 * Workout View
 *
 * @package   Briantics\Joncsi
 * @link      https://briantics.com/joncsi
 * @author    Briantics, Inc.
 * @copyright Copyright © 2018 Briantics, Inc.
 * @license   GPL-3.0-or-later
 */

if ( ! function_exists( 'get_field' ) ) {
	return;
}

if ( have_rows( 'workout_options' ) && count( get_field( 'workout_options' ) ) > 1 ) :
	$active = true;
	?>
	<ul class="workout-switch">
		<?php
		foreach ( get_field( 'workout_options' ) as $option ) :
			$class  = $active ? ' class="active"' : '';
			$active = false;
			?>
			<li class="source-<?php echo esc_attr( $option['source']['value'] ); ?>"><a href="#<?php echo esc_attr( $option['source']['value'] ); ?>"<?php echo $class; ?>><?php echo $option['source']['label']; ?></a></li>
		<?php endforeach; ?>
	</ul>
	<?php
endif;

$active = true;

foreach ( get_field( 'workout_options' ) as $option ) :
	$class  = $active ? ' active' : '';
	$active = false;
	?>
	<div id="<?php echo esc_attr( $option['source']['value'] ); ?>" class="workout-content<?php echo esc_attr( $class ); ?>">
		<div class="mobile-workout-title"><?php joncsi_heart_icon(); ?><?php echo $workout_title; ?></div>
		<?php if ( $option['warm_up'] ) : ?>
			<div class="warm-up">
				<header>Warm Up</header>
				<article>
					<?php echo $option['warm_up']; ?>
				</article>
			</div>
		<?php endif; ?>

		<?php if ( $option['strength_group']['strength'] ) : ?>
			<div class="strength">
				<header>Strength</header>
				<article>
					<?php if ( $option['strength_group']['heading'] ) : ?>
						<h2><?php echo esc_html( $option['strength_group']['heading'] ); ?></h2>
					<?php endif; ?>
					<?php echo $option['strength_group']['strength']; ?>
				</article>
			</div>
		<?php endif; ?>

		<?php if ( $option['conditioning_group']['conditioning'] ) : ?>
			<div class="conditioning">
				<header>Conditioning</header>
				<article>
					<?php if ( $option['conditioning_group']['heading'] ) : ?>
						<h2><?php echo esc_html( $option['conditioning_group']['heading'] ); ?></h2>
					<?php endif; ?>
					<?php echo $option['conditioning_group']['conditioning']; ?>
				</article>
			</div>
		<?php endif; ?>

		<?php if ( $option['extra'] ) : ?>
			<div class="extra">
				<header>Extra</header>
				<article>
					<?php echo $option['extra']; ?>
				</article>
			</div>
		<?php endif; ?>
	</div>
	<?php
endforeach;
