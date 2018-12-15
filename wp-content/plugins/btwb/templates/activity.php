<h5>Recent Gym Activity</h5>

{{#activities}}
<ul class="btwb-result-list">
  {{#workout_session}}
  <li class="clearfix">
    <img src="{{member_logo_url}}" class="athlete-image"/>
    <div class="btwb-result-container">
	    <div class="btwb-athlete-name">{{member_name}}</div>
      <div class="btwb-result-attributes">
	      <span><small>{{time_ago}}</small> via</span>
        <span> 
	        <a href="{{result_url}}">
     	      <img src="https://s3.amazonaws.com/assets.beyondthewhiteboard.com/images/btwb-icon.png"/>
     	    </a>
     	  </span>
		    {{#is_personal_record}}
        <span><img src="https://s3.amazonaws.com/assets.beyondthewhiteboard.com/images/personal_record_icon_width_15.png"/></span>	
	      {{/is_personal_record}}
	    </div>
      <hr/>
	    <div class="btwb-result">
		    <div class="btwb-workout-name">{{workout_name}}</div>
		    <div class="btwb-result-score">
			    <a href="{{result_url}}">{{result}}
			      {{#is_prescribed}} | Rx'd {{/is_prescribed}}
			      {{^is_prescribed}} | Non Rx'd {{/is_prescribed}}
          </a>
		    </div>
		    <div class="btwb-result-score-notes">{{notes}}</div>	      
	    </div>
    </div>
  </li>
  {{/workout_session}}
</ul>
{{/activities}}

{{^activities}}
  There are no recent results. Please check back later.
{{/activities}}
