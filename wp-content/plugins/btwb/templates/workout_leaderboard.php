<h4><a href="{{workout_url}}">{{workout_name}}</a></h4>
<p class="btwb-workout-description">{{workout_description}}</p>
<div class="btwb-leaderboard">
  <div class="btwb-mens-leaderboard">
    <h5>Men's Leaderboard</h5>
    <hr/>
    <ol class="btwb-result-list">
      {{#male_leaderboard}}
      <li class="clearfix">
        <img src="{{member_logo_url}}" class="athlete-image"/>
        <div class="btwb-result-container">
	        <div class="btwb-athlete-name">{{member_name}}</div>
          <div class="btwb-result-attributes">
	          <span><small>{{session_date_string}}</small> via</span>
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
      {{/male_leaderboard}}
    </ol>
  </div>
  <div class="btwb-womens-leaderboard">
    <h5>Women's Leaderboard</h5>
    <hr/>
    <ol class="btwb-result-list">
      {{#female_leaderboard}}
      <li class="clearfix">
        <img src="{{member_logo_url}}" class="athlete-image"/>
        <div class="btwb-result-container">
	        <div class="btwb-athlete-name">{{member_name}}</div>
          <div class="btwb-result-attributes">
	          <span><small>{{session_date_string}}</small> via</span>
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
      {{/female_leaderboard}}
    </ol>
  </div>
  <div style="clear:both;"></div>
</div>
