extends Camera3D

var zoom_speed = 0.1   #Speed of zooming out
var zoom_duration = 15.0  #Time(in s) for the camera to zoom out
var elapsed_time = 0.0  # To track how much time has elapsed

func _process(delta): #_process(delta) is a callback fn (repeats every frame)
	if elapsed_time < zoom_duration:
		translate(Vector3(0, 0, zoom_speed * delta))
		elapsed_time += delta
