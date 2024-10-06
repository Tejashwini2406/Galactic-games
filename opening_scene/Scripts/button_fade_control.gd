extends Control

@onready var Play = $PlayButton
@onready var Settings = $SettingsButton
@onready var Quit = $QuitButton 
@onready var Title = $Label

func _ready():
	Play.modulate.a = 0.0
	Settings.modulate.a = 0.0
	Quit.modulate.a = 0.0
	Title.modulate.a = 0.0
	var tween = get_tree().create_tween()
	fade_in(Title, tween, 5.0)
	fade_in(Play, tween, 5.0)
	fade_in(Settings, tween, 5.0)
	fade_in(Quit, tween, 5.0)
	
	
func fade_in(node: CanvasItem, tween: Tween, duration: float):
	await(get_tree().create_timer(10.0))
	tween.tween_property(Title, "modulate:a", 1.0, 5.0)
	tween.parallel().tween_property(Play, "modulate:a", 1.0, 5.0)
	tween.parallel().tween_property(Settings, "modulate:a", 1.0, 5.0)
	tween.parallel().tween_property(Quit, "modulate:a", 1.0, 5.0)


func _on_quit_button_pressed():
	get_tree().quit()
