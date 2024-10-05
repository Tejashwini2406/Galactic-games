extends MeshInstance3D

@export var rotation_speed: Vector3 = Vector3(0, 0.5, 0)  # Rotate on the Y axis

# This function is called every frame
func _process(delta: float) -> void:
	rotate_x(rotation_speed.x * delta * 180)
	rotate_y(rotation_speed.y * delta * 0.5)
	rotate_z(rotation_speed.z * delta)
