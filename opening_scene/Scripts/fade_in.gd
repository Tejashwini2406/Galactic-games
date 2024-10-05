extends ColorRect

func _ready():
	$AnimationPlayer.animation_finished.connect(_on_animation_finished)
	$AnimationPlayer.play("fade_out")

func _on_animation_finished(anim_name):
	if anim_name == "fade_out":
		queue_free()
