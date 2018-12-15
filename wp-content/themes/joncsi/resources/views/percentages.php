<?php
/**
 * Percentage Matrix
 *
 * @package   Briantics\Joncsi
 * @link      https://briantics.com/joncsi
 * @author    Briantics, Inc.
 * @copyright Copyright © 2018 Briantics, Inc.
 * @license   GPL-3.0-or-later
 */

if ( ! have_rows( '_percentages' ) ) :
	return;
endif;

$percentages = get_field( '_percentages', $workout_id );
$max         = get_field( '_range', $workout_id );
$weights     = range( 45, $max, 5 );
?>
<table class="percentages">
	<thead>
		<tr>
			<th><?php _e( 'Weight', 'joncsi' ); ?></th>
			<?php foreach ( $percentages as $percentage ) : ?>
				<th><?php echo $percentage['percent']; ?>%</th>
			<?php endforeach; ?>
		</tr>
	</thead>
	<tfoot>
		<tr>
			<th><?php _e( 'Weight', 'joncsi' ); ?></th>
			<?php foreach ( $percentages as $percentage ) : ?>
				<th><?php echo $percentage['percent']; ?>%</th>
			<?php endforeach; ?>
		</tr>
	</tfoot>
	<tbody>
		<?php foreach ( $weights as $weight ) : ?>
			<tr>
				<td><?php echo $weight; ?> lb</td>
				<?php
				foreach ( $percentages as $percentage ) :
					$percentage = (int) $percentage['percent'];
					$weight     = (int) $weight;
					$percent    = round( $weight * ( $percentage / 100 ), 1 );
					echo '<td>' . $percent . ' lb</td>';
				endforeach;
				?>
			</tr>
		<?php endforeach; ?>
	</tbody>
</table>
