# @cjsx React.DOM

React = require('react')

module.exports = React.createClass
  getInitialState: ->
  	repos: []
  componentDidMount: ->
  	# do ajax here
  	$.ajax({
      url: "https://api.github.com/users/enriquez/repos"
  	  dataType: "JSON"
  	  data:
  	    type: "all"
  	  method: "GET"
  	  success: =>
  	  	data = arguments[0]
  	  	this.setState({repos:data})
	})
  componentWillUnmount: ->
  	# unmount
  render: ->
    <h1>Github Repos</h1>
    <p>{this.state.repos}</p>